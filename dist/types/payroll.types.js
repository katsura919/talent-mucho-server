import { z } from 'zod';
// Payroll status enum
export const payrollStatusEnum = z.enum([
    'draft',
    'calculated',
    'approved',
    'paid'
]);
// Deduction/Addition schema
export const payrollAdjustmentSchema = z.object({
    type: z.string().min(1, 'Type is required').max(50),
    description: z.string().max(200).optional(),
    amount: z.number(),
});
// Payroll schema
export const payrollSchema = z.object({
    _id: z.string().optional(),
    staffId: z.string().min(1, 'Staff ID is required'),
    businessId: z.string().min(1, 'Business ID is required'),
    // Pay period
    periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    // Hours breakdown
    totalHoursWorked: z.number().default(0),
    totalDaysWorked: z.number().default(0),
    // Salary info (copied from staff at time of generation)
    salaryType: z.enum(['hourly', 'daily', 'monthly', 'annual']),
    baseSalary: z.number().positive(),
    // Calculated amounts
    calculatedPay: z.number().default(0),
    // Adjustments
    deductions: z.array(payrollAdjustmentSchema).default([]),
    additions: z.array(payrollAdjustmentSchema).default([]),
    // Final amount
    netPay: z.number().default(0),
    // Linked attendance records
    attendanceIds: z.array(z.string()).default([]),
    attendanceCount: z.number().default(0),
    // Status and approval
    status: payrollStatusEnum.default('draft'),
    approvedBy: z.string().optional(),
    approvedAt: z.string().datetime().optional(),
    paidAt: z.string().datetime().optional(),
    // Metadata
    notes: z.string().max(500).optional(),
    isActive: z.boolean().default(true),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});
// Schema for generating payroll
export const generatePayrollSchema = z.object({
    staffId: z.string().min(1, 'Staff ID is required'),
    periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
});
// Schema for batch generating payroll for a business
export const generateBusinessPayrollSchema = z.object({
    periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
});
// Schema for approving payroll
export const approvePayrollSchema = z.object({
    notes: z.string().max(500).optional(),
});
// Schema for adding adjustments
export const addAdjustmentSchema = z.object({
    type: z.enum(['deduction', 'addition']),
    adjustmentType: z.string().min(1).max(50),
    description: z.string().max(200).optional(),
    amount: z.number().positive(),
});
// JSON Schemas for Fastify route validation
export const payrollAdjustmentJsonSchema = {
    type: 'object',
    properties: {
        type: { type: 'string', minLength: 1, maxLength: 50 },
        description: { type: 'string', maxLength: 200 },
        amount: { type: 'number' },
    },
    required: ['type', 'amount'],
};
export const payrollJsonSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        staffId: { type: 'string' },
        businessId: { type: 'string' },
        periodStart: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        periodEnd: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        totalHoursWorked: { type: 'number' },
        totalDaysWorked: { type: 'number' },
        salaryType: { type: 'string', enum: ['hourly', 'daily', 'monthly', 'annual'] },
        baseSalary: { type: 'number' },
        calculatedPay: { type: 'number' },
        deductions: { type: 'array', items: payrollAdjustmentJsonSchema },
        additions: { type: 'array', items: payrollAdjustmentJsonSchema },
        netPay: { type: 'number' },
        attendanceIds: { type: 'array', items: { type: 'string' } },
        attendanceCount: { type: 'number' },
        status: { type: 'string', enum: ['draft', 'calculated', 'approved', 'paid'] },
        approvedBy: { type: 'string' },
        approvedAt: { type: 'string', format: 'date-time' },
        paidAt: { type: 'string', format: 'date-time' },
        notes: { type: 'string', maxLength: 500 },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
    required: ['staffId', 'businessId', 'periodStart', 'periodEnd', 'salaryType', 'baseSalary'],
};
export const generatePayrollJsonSchema = {
    type: 'object',
    properties: {
        staffId: { type: 'string' },
        periodStart: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        periodEnd: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    },
    required: ['staffId', 'periodStart', 'periodEnd'],
};
export const generateBusinessPayrollJsonSchema = {
    type: 'object',
    properties: {
        periodStart: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        periodEnd: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    },
    required: ['periodStart', 'periodEnd'],
};
export const approvePayrollJsonSchema = {
    type: 'object',
    properties: {
        notes: { type: 'string', maxLength: 500 },
    },
};
export const addAdjustmentJsonSchema = {
    type: 'object',
    properties: {
        type: { type: 'string', enum: ['deduction', 'addition'] },
        adjustmentType: { type: 'string', minLength: 1, maxLength: 50 },
        description: { type: 'string', maxLength: 200 },
        amount: { type: 'number' },
    },
    required: ['type', 'adjustmentType', 'amount'],
};
//# sourceMappingURL=payroll.types.js.map