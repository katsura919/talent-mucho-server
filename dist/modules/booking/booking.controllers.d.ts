import type { FastifyRequest, FastifyReply } from "fastify";
interface IdParams {
    id: string;
}
export declare function createBooking(request: FastifyRequest<{
    Body: unknown;
}>, reply: FastifyReply): Promise<never>;
export declare function getAllBookings(request: FastifyRequest, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getBookingById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function updateBooking(request: FastifyRequest<{
    Params: IdParams;
    Body: unknown;
}>, reply: FastifyReply): Promise<never>;
export declare function deleteBooking(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<never>;
export declare function getBookingsByBusinessId(request: FastifyRequest<{
    Params: {
        businessId: string;
    };
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export {};
//# sourceMappingURL=booking.controllers.d.ts.map