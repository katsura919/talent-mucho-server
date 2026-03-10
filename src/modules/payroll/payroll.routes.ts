import type { FastifyPluginAsync } from "fastify";
import {
    payrollJsonSchema,
    generatePayrollJsonSchema,
    generateBusinessPayrollJsonSchema,
    approvePayrollJsonSchema,
    addAdjustmentJsonSchema,
} from "../../types/payroll.types.js";
import {
    generatePayroll,
    generateBusinessPayroll,
    getPayrollById,
    getPayrollByStaff,
    getPayrollByBusiness,
    approvePayroll,
    markPayrollPaid,
    addPayrollAdjustment,
    deletePayroll,
} from "./payroll.controllers.js";

const payrollRoutes: FastifyPluginAsync = async (fastify) => {
    // ==================== PAYROLL GENERATION ====================

    // POST /payroll/generate - Generate payroll for a staff member
    fastify.post(
        "/payroll/generate",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Generate payroll for a staff member (requires authentication)",
                tags: ["Payroll"],
                security: [{ bearerAuth: [] }],
                body: generatePayrollJsonSchema,
                response: {
                    201: {
                        type: "object",
                        properties: {
                            ...payrollJsonSchema.properties,
                            message: { type: "string" },
                        },
                    },
                    400: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            details: { type: "array" },
                            message: { type: "string" },
                        },
                    },
                    403: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                    404: {
                        type: "object",
                        properties: { error: { type: "string" } },
                    },
                    409: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                            payrollId: { type: "string" },
                        },
                    },
                },
            },
        },
        generatePayroll,
    );

    // POST /businesses/:businessId/payroll/generate - Batch generate payroll
    fastify.post<{ Params: { businessId: string } }>(
        "/businesses/:businessId/payroll/generate",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Generate payroll for all staff in a business (requires authentication)",
                tags: ["Payroll"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        businessId: { type: "string", description: "Business ID (MongoDB ObjectId)" },
                    },
                    required: ["businessId"],
                },
                body: generateBusinessPayrollJsonSchema,
                response: {
                    200: {
                        type: "object",
                        properties: {
                            message: { type: "string" },
                            summary: {
                                type: "object",
                                properties: {
                                    total: { type: "number" },
                                    generated: { type: "number" },
                                    skipped: { type: "number" },
                                    errors: { type: "number" },
                                },
                            },
                            generated: { type: "array" },
                            skipped: { type: "array" },
                            errors: { type: "array" },
                        },
                    },
                    403: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                },
            },
        },
        generateBusinessPayroll,
    );

    // ==================== PAYROLL RETRIEVAL ====================

    // GET /payroll/:id - Get payroll by ID
    fastify.get<{ Params: { id: string } }>(
        "/payroll/:id",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Get a payroll record by ID (requires authentication)",
                tags: ["Payroll"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string", description: "Payroll ID (MongoDB ObjectId)" },
                    },
                    required: ["id"],
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            ...payrollJsonSchema.properties,
                            staff: {
                                type: "object",
                                properties: {
                                    firstName: { type: "string" },
                                    lastName: { type: "string" },
                                    position: { type: "string" },
                                },
                            },
                        },
                    },
                    403: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                    404: {
                        type: "object",
                        properties: { error: { type: "string" } },
                    },
                },
            },
        },
        getPayrollById,
    );

    // GET /staff/:staffId/payroll - Get payroll by staff
    fastify.get<{ Params: { staffId: string }; Querystring: { status?: string; startDate?: string; endDate?: string } }>(
        "/staff/:staffId/payroll",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Get all payroll records for a staff member (requires authentication)",
                tags: ["Payroll"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        staffId: { type: "string", description: "Staff ID (MongoDB ObjectId)" },
                    },
                    required: ["staffId"],
                },
                querystring: {
                    type: "object",
                    properties: {
                        status: { type: "string", enum: ["draft", "calculated", "approved", "paid"] },
                        startDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                        endDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                    },
                },
                response: {
                    200: {
                        type: "array",
                        items: payrollJsonSchema,
                    },
                    403: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                    404: {
                        type: "object",
                        properties: { error: { type: "string" } },
                    },
                },
            },
        },
        getPayrollByStaff,
    );

    // GET /businesses/:businessId/payroll - Get payroll by business
    fastify.get<{ Params: { businessId: string }; Querystring: { status?: string; startDate?: string; endDate?: string } }>(
        "/businesses/:businessId/payroll",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Get all payroll records for a business (requires authentication)",
                tags: ["Payroll"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        businessId: { type: "string", description: "Business ID (MongoDB ObjectId)" },
                    },
                    required: ["businessId"],
                },
                querystring: {
                    type: "object",
                    properties: {
                        status: { type: "string", enum: ["draft", "calculated", "approved", "paid"] },
                        startDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                        endDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                    },
                },
                response: {
                    200: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                ...payrollJsonSchema.properties,
                                staff: {
                                    type: "object",
                                    properties: {
                                        firstName: { type: "string" },
                                        lastName: { type: "string" },
                                        position: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    403: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                },
            },
        },
        getPayrollByBusiness,
    );

    // ==================== PAYROLL ACTIONS ====================

    // PUT /payroll/:id/approve - Approve payroll
    fastify.put<{ Params: { id: string } }>(
        "/payroll/:id/approve",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Approve a payroll record (requires authentication)",
                tags: ["Payroll"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string", description: "Payroll ID (MongoDB ObjectId)" },
                    },
                    required: ["id"],
                },
                body: approvePayrollJsonSchema,
                response: {
                    200: {
                        type: "object",
                        properties: {
                            ...payrollJsonSchema.properties,
                            message: { type: "string" },
                        },
                    },
                    400: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                    403: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                    404: {
                        type: "object",
                        properties: { error: { type: "string" } },
                    },
                },
            },
        },
        approvePayroll,
    );

    // PUT /payroll/:id/paid - Mark payroll as paid
    fastify.put<{ Params: { id: string } }>(
        "/payroll/:id/paid",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Mark a payroll record as paid (requires authentication)",
                tags: ["Payroll"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string", description: "Payroll ID (MongoDB ObjectId)" },
                    },
                    required: ["id"],
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            ...payrollJsonSchema.properties,
                            message: { type: "string" },
                        },
                    },
                    400: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                    403: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                    404: {
                        type: "object",
                        properties: { error: { type: "string" } },
                    },
                },
            },
        },
        markPayrollPaid,
    );

    // POST /payroll/:id/adjustment - Add adjustment (deduction/addition)
    fastify.post<{ Params: { id: string } }>(
        "/payroll/:id/adjustment",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Add a deduction or addition to a payroll record (requires authentication)",
                tags: ["Payroll"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string", description: "Payroll ID (MongoDB ObjectId)" },
                    },
                    required: ["id"],
                },
                body: addAdjustmentJsonSchema,
                response: {
                    200: {
                        type: "object",
                        properties: {
                            ...payrollJsonSchema.properties,
                            message: { type: "string" },
                        },
                    },
                    400: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            details: { type: "array" },
                            message: { type: "string" },
                        },
                    },
                    403: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                    404: {
                        type: "object",
                        properties: { error: { type: "string" } },
                    },
                },
            },
        },
        addPayrollAdjustment,
    );

    // DELETE /payroll/:id - Soft delete payroll
    fastify.delete<{ Params: { id: string } }>(
        "/payroll/:id",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Soft delete a payroll record (requires authentication)",
                tags: ["Payroll"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string", description: "Payroll ID (MongoDB ObjectId)" },
                    },
                    required: ["id"],
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            message: { type: "string" },
                        },
                    },
                    400: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                    403: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                    404: {
                        type: "object",
                        properties: { error: { type: "string" } },
                    },
                },
            },
        },
        deletePayroll,
    );
};

export default payrollRoutes;
