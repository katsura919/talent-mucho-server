import { z } from 'zod';
// Attendance status enum
export const attendanceStatusEnum = z.enum([
    'pending',
    'approved',
    'rejected'
]);
// Attendance schema
export const attendanceSchema = z.object({
    _id: z.string().optional(),
    staffId: z.string().min(1, 'Staff ID is required'),
    businessId: z.string().min(1, 'Business ID is required'),
    clockIn: z.string().datetime(),
    clockOut: z.string().datetime().optional(),
    hoursWorked: z.number().optional(),
    workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'), // Business day this shift belongs to
    status: attendanceStatusEnum.default('pending'),
    notes: z.string().max(500).optional(),
    adminNotes: z.string().max(500).optional(),
    approvedBy: z.string().optional(),
    approvedAt: z.string().datetime().optional(),
    isActive: z.boolean().default(true),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});
// Schema for clocking in
export const clockInSchema = z.object({
    notes: z.string().max(500).optional(),
});
// Schema for clocking out
export const clockOutSchema = z.object({
    notes: z.string().max(500).optional(),
});
// Schema for admin to approve/reject attendance
export const approveAttendanceSchema = z.object({
    status: z.enum(['approved', 'rejected']),
    adminNotes: z.string().max(500).optional(),
});
// Schema for admin to edit attendance
export const editAttendanceSchema = z.object({
    clockIn: z.string().datetime().optional(),
    clockOut: z.string().datetime().optional(),
    workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
    notes: z.string().max(500).optional(),
    adminNotes: z.string().max(500).optional(),
    status: attendanceStatusEnum.optional(),
});
// JSON Schemas for Fastify route validation
export const attendanceJsonSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        staffId: { type: 'string' },
        businessId: { type: 'string' },
        clockIn: { type: 'string', format: 'date-time' },
        clockOut: { type: 'string', format: 'date-time' },
        hoursWorked: { type: 'number' },
        workDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
        notes: { type: 'string', maxLength: 500 },
        adminNotes: { type: 'string', maxLength: 500 },
        approvedBy: { type: 'string' },
        approvedAt: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
    required: ['staffId', 'businessId', 'clockIn', 'workDate'],
};
export const clockInJsonSchema = {
    type: 'object',
    properties: {
        notes: { type: 'string', maxLength: 500 },
    },
};
export const clockOutJsonSchema = {
    type: 'object',
    properties: {
        notes: { type: 'string', maxLength: 500 },
    },
};
export const approveAttendanceJsonSchema = {
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['approved', 'rejected'] },
        adminNotes: { type: 'string', maxLength: 500 },
    },
    required: ['status'],
};
export const editAttendanceJsonSchema = {
    type: 'object',
    properties: {
        clockIn: { type: 'string', format: 'date-time' },
        clockOut: { type: 'string', format: 'date-time' },
        workDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        notes: { type: 'string', maxLength: 500 },
        adminNotes: { type: 'string', maxLength: 500 },
        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
    },
};
//# sourceMappingURL=attendance.types.js.map