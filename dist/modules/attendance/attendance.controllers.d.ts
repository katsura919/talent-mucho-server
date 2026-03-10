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
interface AttendanceQuery {
    businessId?: string;
    staffId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}
export declare function clockIn(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function clockOut(request: FastifyRequest, reply: FastifyReply): Promise<{
    message: string;
    hoursWorked: number;
    _id?: ObjectId | undefined;
}>;
export declare function getMyAttendance(request: FastifyRequest<{
    Querystring: {
        startDate?: string;
        endDate?: string;
        status?: string;
    };
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getAllAttendance(request: FastifyRequest<{
    Querystring: AttendanceQuery;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getAttendanceByBusiness(request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: AttendanceQuery;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getAttendanceByStaff(request: FastifyRequest<{
    Params: StaffIdParams;
    Querystring: AttendanceQuery;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function approveAttendance(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
    _id?: ObjectId | undefined;
}>;
export declare function editAttendance(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document> | null>;
export declare function deleteAttendance(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=attendance.controllers.d.ts.map