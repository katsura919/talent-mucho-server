import type { FastifyPluginAsync } from "fastify";
import {
    attendanceJsonSchema,
    clockInJsonSchema,
    clockOutJsonSchema,
    approveAttendanceJsonSchema,
    editAttendanceJsonSchema,
} from "../../types/attendance.types.js";
import {
    clockIn,
    clockOut,
    getMyAttendance,
    getAllAttendance,
    getAttendanceByBusiness,
    getAttendanceByStaff,
    approveAttendance,
    editAttendance,
    deleteAttendance,
} from "./attendance.controllers.js";

const attendanceRoutes: FastifyPluginAsync = async (fastify) => {
    // ==================== STAFF ROUTES ====================

    // POST /attendance/clock-in - Staff clocks in
    fastify.post(
        "/attendance/clock-in",
        {
            preHandler: [fastify.authenticateStaff],
            schema: {
                description: "Staff clocks in for work",
                tags: ["Attendance"],
                security: [{ bearerAuth: [] }],
                body: clockInJsonSchema,
                response: {
                    201: {
                        type: "object",
                        properties: {
                            ...attendanceJsonSchema.properties,
                            message: { type: "string" },
                        },
                    },
                    409: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                            attendanceId: { type: "string" },
                        },
                    },
                },
            },
        },
        clockIn,
    );

    // POST /attendance/clock-out - Staff clocks out
    fastify.post(
        "/attendance/clock-out",
        {
            preHandler: [fastify.authenticateStaff],
            schema: {
                description: "Staff clocks out from work",
                tags: ["Attendance"],
                security: [{ bearerAuth: [] }],
                body: clockOutJsonSchema,
                response: {
                    200: {
                        type: "object",
                        properties: {
                            ...attendanceJsonSchema.properties,
                            message: { type: "string" },
                        },
                    },
                    404: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                },
            },
        },
        clockOut,
    );

    // GET /attendance/me - Staff views their own attendance
    fastify.get<{ Querystring: { startDate?: string; endDate?: string; status?: string } }>(
        "/attendance/me",
        {
            preHandler: [fastify.authenticateStaff],
            schema: {
                description: "Get current staff's attendance records",
                tags: ["Attendance"],
                security: [{ bearerAuth: [] }],
                querystring: {
                    type: "object",
                    properties: {
                        startDate: { type: "string", format: "date-time" },
                        endDate: { type: "string", format: "date-time" },
                        status: { type: "string", enum: ["pending", "approved", "rejected"] },
                    },
                },
                response: {
                    200: {
                        type: "array",
                        items: attendanceJsonSchema,
                    },
                },
            },
        },
        getMyAttendance,
    );

    // ==================== ADMIN ROUTES ====================

    // GET /attendance - Admin views all attendance
    fastify.get<{ Querystring: { businessId?: string; staffId?: string; status?: string; startDate?: string; endDate?: string } }>(
        "/attendance",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Get all attendance records (admin only, filtered by business access)",
                tags: ["Attendance"],
                security: [{ bearerAuth: [] }],
                querystring: {
                    type: "object",
                    properties: {
                        businessId: { type: "string" },
                        staffId: { type: "string" },
                        status: { type: "string", enum: ["pending", "approved", "rejected"] },
                        startDate: { type: "string", format: "date-time" },
                        endDate: { type: "string", format: "date-time" },
                    },
                },
                response: {
                    200: {
                        type: "array",
                        items: attendanceJsonSchema,
                    },
                },
            },
        },
        getAllAttendance,
    );

    // GET /businesses/:businessId/attendance - Admin views attendance by business
    fastify.get<{ Params: { businessId: string }; Querystring: { status?: string; startDate?: string; endDate?: string } }>(
        "/businesses/:businessId/attendance",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Get attendance records for a specific business",
                tags: ["Attendance"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        businessId: { type: "string" },
                    },
                    required: ["businessId"],
                },
                querystring: {
                    type: "object",
                    properties: {
                        status: { type: "string", enum: ["pending", "approved", "rejected"] },
                        startDate: { type: "string", format: "date-time" },
                        endDate: { type: "string", format: "date-time" },
                    },
                },
                response: {
                    200: {
                        type: "array",
                        items: attendanceJsonSchema,
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
        getAttendanceByBusiness,
    );

    // GET /staff/:staffId/attendance - Admin views attendance by staff
    fastify.get<{ Params: { staffId: string }; Querystring: { status?: string; startDate?: string; endDate?: string } }>(
        "/staff/:staffId/attendance",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Get attendance records for a specific staff member",
                tags: ["Attendance"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        staffId: { type: "string" },
                    },
                    required: ["staffId"],
                },
                querystring: {
                    type: "object",
                    properties: {
                        status: { type: "string", enum: ["pending", "approved", "rejected"] },
                        startDate: { type: "string", format: "date-time" },
                        endDate: { type: "string", format: "date-time" },
                    },
                },
                response: {
                    200: {
                        type: "array",
                        items: attendanceJsonSchema,
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
                        properties: {
                            error: { type: "string" },
                        },
                    },
                },
            },
        },
        getAttendanceByStaff,
    );

    // PUT /attendance/:id/approve - Admin approves/rejects attendance
    fastify.put<{ Params: { id: string } }>(
        "/attendance/:id/approve",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Approve or reject an attendance record",
                tags: ["Attendance"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                    required: ["id"],
                },
                body: approveAttendanceJsonSchema,
                response: {
                    200: {
                        type: "object",
                        properties: {
                            ...attendanceJsonSchema.properties,
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
                        properties: {
                            error: { type: "string" },
                        },
                    },
                },
            },
        },
        approveAttendance,
    );

    // PUT /attendance/:id - Admin edits attendance
    fastify.put<{ Params: { id: string } }>(
        "/attendance/:id",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Edit an attendance record (clock times, notes)",
                tags: ["Attendance"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                    required: ["id"],
                },
                body: editAttendanceJsonSchema,
                response: {
                    200: attendanceJsonSchema,
                    403: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                    404: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                        },
                    },
                },
            },
        },
        editAttendance,
    );

    // DELETE /attendance/:id - Admin soft-deletes attendance
    fastify.delete<{ Params: { id: string } }>(
        "/attendance/:id",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Soft delete an attendance record",
                tags: ["Attendance"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
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
                    403: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                    404: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                        },
                    },
                },
            },
        },
        deleteAttendance,
    );
};

export default attendanceRoutes;
