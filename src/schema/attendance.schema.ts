import { z } from "zod";
import {
    attendanceSchema,
    clockInSchema,
    clockOutSchema,
    approveAttendanceSchema,
    editAttendanceSchema,
} from "../types/attendance.types.js";

// Infer TypeScript types from Zod schemas
export type Attendance = z.infer<typeof attendanceSchema>;
export type ClockInInput = z.infer<typeof clockInSchema>;
export type ClockOutInput = z.infer<typeof clockOutSchema>;
export type ApproveAttendanceInput = z.infer<typeof approveAttendanceSchema>;
export type EditAttendanceInput = z.infer<typeof editAttendanceSchema>;

// MongoDB document type (with ObjectId)
export interface AttendanceDocument {
    _id?: string;
    staffId: string;
    businessId: string;
    clockIn: string;
    clockOut?: string;
    hoursWorked?: number;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    adminNotes?: string;
    approvedBy?: string;
    approvedAt?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
