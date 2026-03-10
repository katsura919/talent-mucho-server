import type { FastifyRequest, FastifyReply } from "fastify";
interface IdParams {
    id: string;
}
interface SlugParams {
    slug: string;
}
interface CommentQuery {
    blogId?: string;
    isApproved?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}
export declare function getCommentsBySlug(request: FastifyRequest<{
    Params: SlugParams;
    Querystring: {
        page?: number;
        limit?: number;
    };
}>, reply: FastifyReply): Promise<{
    data: {
        _id: string;
        comment: any;
        createdAt: any;
        lead: {
            _id: string;
            name: any;
        } | null;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getAllComments(request: FastifyRequest<{
    Querystring: CommentQuery;
}>, reply: FastifyReply): Promise<{
    data: {
        _id: any;
        blogId: any;
        comment: any;
        isApproved: any;
        createdAt: any;
        updatedAt: any;
        lead: {
            _id: any;
            name: any;
            email: any;
            phone: any;
        } | null;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: any;
        totalPages: number;
    };
}>;
export declare function createComment(request: FastifyRequest<{
    Params: SlugParams;
}>, reply: FastifyReply): Promise<{
    blogId: string;
    leadId: string;
    comment: string;
    isApproved: boolean;
    createdAt: string;
    updatedAt: string;
    _id: string;
}>;
export declare function approveComment(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function updateComment(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function deleteComment(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=comment.controllers.d.ts.map