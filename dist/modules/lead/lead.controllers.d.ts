import type { FastifyRequest, FastifyReply } from "fastify";
interface IdParams {
    id: string;
}
interface EmailParams {
    email: string;
}
interface LeadQuery {
    status?: "new" | "contacted" | "qualified" | "converted";
    source?: "blog_comment" | "contact_form" | "other";
    search?: string;
    page?: number;
    limit?: number;
}
export declare function getAllLeads(request: FastifyRequest<{
    Querystring: LeadQuery;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[] | {
    data: import("mongodb").WithId<import("bson").Document>[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getLeadById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function getLeadByEmail(request: FastifyRequest<{
    Params: EmailParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function createLead(request: FastifyRequest, reply: FastifyReply): Promise<{
    _id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    status: "contacted" | "new" | "qualified" | "converted";
    name: string;
    isActive: boolean;
    phone: string;
    source: "blog_comment" | "contact_form" | "other";
    notes?: string | undefined;
}>;
export declare function updateLead(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function updateLeadStatus(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function deleteLead(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=lead.controllers.d.ts.map