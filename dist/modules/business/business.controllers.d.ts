import type { FastifyRequest, FastifyReply } from "fastify";
interface IdParams {
    id: string;
}
interface SlugParams {
    slug: string;
}
export declare function getAllBusinesses(request: FastifyRequest, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getBusinessById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function getBusinessBySlug(request: FastifyRequest<{
    Params: SlugParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function createBusiness(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function updateBusiness(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function deleteBusiness(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<never>;
export declare function uploadBusinessLogo(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<never>;
export {};
//# sourceMappingURL=business.controllers.d.ts.map