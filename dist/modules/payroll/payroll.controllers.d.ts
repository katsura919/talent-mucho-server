import type { FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";
interface IdParams {
    id: string;
}
interface BusinessIdParams {
    businessId: string;
}
interface StaffIdParams {
    staffId: string;
}
interface PayrollQuery {
    status?: string;
    startDate?: string;
    endDate?: string;
}
export declare function generatePayroll(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function generateBusinessPayroll(request: FastifyRequest<{
    Params: BusinessIdParams;
}>, reply: FastifyReply): Promise<{
    generated: any[];
    skipped: any[];
    errors: any[];
    message: string;
    summary: {
        total: number;
        generated: number;
        skipped: number;
        errors: number;
    };
}>;
export declare function getPayrollById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    staff: {
        firstName: any;
        lastName: any;
        position: any;
    } | null;
    _id: ObjectId;
}>;
export declare function getPayrollByStaff(request: FastifyRequest<{
    Params: StaffIdParams;
    Querystring: PayrollQuery;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getPayrollByBusiness(request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: PayrollQuery;
}>, reply: FastifyReply): Promise<{
    staff: {
        firstName: any;
        lastName: any;
        position: any;
    } | null;
    _id: ObjectId;
}[]>;
export declare function approvePayroll(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
    _id?: ObjectId | undefined;
}>;
export declare function markPayrollPaid(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
    _id?: ObjectId | undefined;
}>;
export declare function addPayrollAdjustment(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
    _id?: ObjectId | undefined;
}>;
export declare function deletePayroll(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=payroll.controllers.d.ts.map