import { z } from "zod";
import { blogSchema, createBlogSchema, updateBlogSchema } from "../types/blog.types.js";
export type Blog = z.infer<typeof blogSchema>;
export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export interface BlogDocument {
    _id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    contentImages?: string[];
    category?: string;
    businessId: string;
    authorId: string;
    status: "draft" | "published";
    publishedAt?: string;
    viewCount: number;
    commentCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=blogs.schema.d.ts.map