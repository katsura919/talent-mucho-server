import type { FastifyRequest, FastifyReply } from "fastify";
interface IdParams {
    id: string;
}
interface SlugParams {
    slug: string;
}
interface BusinessIdParams {
    businessId: string;
}
interface BlogQuery {
    businessId?: string;
    status?: "draft" | "published";
    category?: string;
}
export declare function getAllBlogs(request: FastifyRequest<{
    Querystring: BlogQuery;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getBlogById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function getBlogBySlug(request: FastifyRequest<{
    Params: SlugParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
interface PublicBlogsQuery {
    businessId?: string;
    category?: string;
    page?: string;
    limit?: string;
}
export declare function getPublicBlogs(request: FastifyRequest<{
    Querystring: PublicBlogsQuery;
}>, reply: FastifyReply): Promise<{
    data: import("bson").Document[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}>;
interface BlogByBusinessQuery {
    search?: string;
    page?: string;
    limit?: string;
    status?: "draft" | "published" | "all";
}
export declare function getBlogsByBusiness(request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: BlogByBusinessQuery;
}>, reply: FastifyReply): Promise<{
    data: import("mongodb").WithId<import("bson").Document>[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}>;
export declare function createBlog(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function updateBlog(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function deleteBlog(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<never>;
export declare function uploadBlogFeaturedImage(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<never>;
export declare function incrementBlogView(request: FastifyRequest<{
    Params: SlugParams;
}>, reply: FastifyReply): Promise<{
    message: string;
    viewCount: any;
}>;
export declare function uploadBlogContentImage(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<never>;
export {};
//# sourceMappingURL=blog.controllers.d.ts.map