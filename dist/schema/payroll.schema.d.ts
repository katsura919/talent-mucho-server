import { z } from "zod";
import { payrollSchema, payrollAdjustmentSchema, generatePayrollSchema, generateBusinessPayrollSchema, approvePayrollSchema, addAdjustmentSchema } from "../types/payroll.types.js";
export type Payroll = z.infer<typeof payrollSchema>;
export type PayrollAdjustment = z.infer<typeof payrollAdjustmentSchema>;
export type GeneratePayrollInput = z.infer<typeof generatePayrollSchema>;
export type GenerateBusinessPayrollInput = z.infer<typeof generateBusinessPayrollSchema>;
export type ApprovePayrollInput = z.infer<typeof approvePayrollSchema>;
export type AddAdjustmentInput = z.infer<typeof addAdjustmentSchema>;
export interface PayrollAdjustmentType {
    type: string;
    description?: string;
    amount: number;
}
export interface PayrollDocumentType {
    _id?: string;
    staffId: string;
    businessId: string;
    periodStart: string;
    periodEnd: string;
    totalHoursWorked: number;
    totalDaysWorked: number;
    salaryType: 'hourly' | 'daily' | 'monthly' | 'annual';
    baseSalary: number;
    calculatedPay: number;
    deductions: PayrollAdjustmentType[];
    additions: PayrollAdjustmentType[];
    netPay: number;
    attendanceIds: string[];
    attendanceCount: number;
    status: 'draft' | 'calculated' | 'approved' | 'paid';
    approvedBy?: string;
    approvedAt?: string;
    paidAt?: string;
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=payroll.schema.d.ts.map