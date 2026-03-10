import { leadJsonSchema, createLeadJsonSchema, updateLeadJsonSchema, updateLeadStatusJsonSchema, } from "../../types/lead.types.js";
import { getAllLeads, getLeadById, getLeadByEmail, createLead, updateLead, updateLeadStatus, deleteLead, } from "./lead.controllers.js";
const leadRoutes = async (fastify) => {
    // GET /leads - Get all leads with optional filters, search, and pagination
    fastify.get("/leads", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Get all leads with optional filters, search, and pagination",
            tags: ["Leads"],
            security: [{ bearerAuth: [] }],
            querystring: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["new", "contacted", "qualified", "converted"],
                        description: "Filter by status",
                    },
                    source: {
                        type: "string",
                        enum: ["blog_comment", "contact_form", "other"],
                        description: "Filter by source",
                    },
                    search: {
                        type: "string",
                        description: "Search by name or email",
                    },
                    page: {
                        type: "number",
                        minimum: 1,
                        description: "Page number (optional, triggers pagination)",
                    },
                    limit: {
                        type: "number",
                        minimum: 1,
                        maximum: 100,
                        default: 10,
                        description: "Items per page (optional)",
                    },
                },
            },
            response: {
                200: {
                    oneOf: [
                        {
                            type: "array",
                            items: leadJsonSchema,
                        },
                        {
                            type: "object",
                            properties: {
                                data: {
                                    type: "array",
                                    items: leadJsonSchema,
                                },
                                pagination: {
                                    type: "object",
                                    properties: {
                                        page: { type: "number" },
                                        limit: { type: "number" },
                                        total: { type: "number" },
                                        totalPages: { type: "number" },
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        },
    }, getAllLeads);
    // GET /leads/:id - Get lead by ID
    fastify.get("/leads/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Get a lead by ID",
            tags: ["Leads"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: { type: "string", description: "Lead ID (MongoDB ObjectId)" },
                },
                required: ["id"],
            },
            response: {
                200: leadJsonSchema,
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, getLeadById);
    // GET /leads/email/:email - Get lead by email
    fastify.get("/leads/email/:email", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Get a lead by email",
            tags: ["Leads"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    email: { type: "string", description: "Lead email address" },
                },
                required: ["email"],
            },
            response: {
                200: leadJsonSchema,
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, getLeadByEmail);
    // POST /leads - Create new lead
    fastify.post("/leads", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Create a new lead",
            tags: ["Leads"],
            security: [{ bearerAuth: [] }],
            body: createLeadJsonSchema,
            response: {
                200: leadJsonSchema,
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        details: { type: "array" },
                    },
                },
                409: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, createLead);
    // PUT /leads/:id - Update lead
    fastify.put("/leads/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Update a lead",
            tags: ["Leads"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: { type: "string", description: "Lead ID (MongoDB ObjectId)" },
                },
                required: ["id"],
            },
            body: updateLeadJsonSchema,
            response: {
                200: leadJsonSchema,
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        details: { type: "array" },
                    },
                },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
                409: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, updateLead);
    // PUT /leads/:id/status - Update lead status
    fastify.put("/leads/:id/status", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Update lead status",
            tags: ["Leads"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: { type: "string", description: "Lead ID (MongoDB ObjectId)" },
                },
                required: ["id"],
            },
            body: updateLeadStatusJsonSchema,
            response: {
                200: leadJsonSchema,
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        details: { type: "array" },
                    },
                },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, updateLeadStatus);
    // DELETE /leads/:id - Delete lead (soft delete)
    fastify.delete("/leads/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Delete a lead (soft delete)",
            tags: ["Leads"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: { type: "string", description: "Lead ID (MongoDB ObjectId)" },
                },
                required: ["id"],
            },
            response: {
                200: {
                    type: "object",
                    properties: { message: { type: "string" } },
                },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, deleteLead);
};
export default leadRoutes;
//# sourceMappingURL=lead.routes.js.map