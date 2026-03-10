import { z } from "zod";
// Blog status enum
export const blogStatusEnum = z.enum(["draft", "published"]);
// Blog schema
export const blogSchema = z.object({
    _id: z.string().optional(),
    title: z.string().min(1, "Title is required").max(200),
    slug: z
        .string()
        .min(1, "Slug is required")
        .max(200)
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
    content: z.string().min(1, "Content is required"),
    excerpt: z.string().max(500).optional(),
    featuredImage: z.string().url().optional(),
    contentImages: z
        .array(z.string().url())
        .max(5, "Maximum 5 content images allowed")
        .optional(),
    category: z.string().max(100).optional(),
    businessId: z.string().min(1, "Business ID is required"),
    authorId: z.string().min(1, "Author ID is required"),
    status: blogStatusEnum.default("draft"),
    publishedAt: z.string().datetime().optional(),
    viewCount: z.number().int().min(0).default(0),
    commentCount: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});
export const createBlogSchema = blogSchema.omit({
    _id: true,
    authorId: true, // Will be set from authenticated user
    publishedAt: true,
    createdAt: true,
    updatedAt: true,
});
export const updateBlogSchema = createBlogSchema
    .partial()
    .omit({ businessId: true });
// JSON Schemas
export const blogJsonSchema = {
    type: "object",
    properties: {
        _id: { type: "string" },
        title: { type: "string", minLength: 1, maxLength: 200 },
        slug: { type: "string", minLength: 1, maxLength: 200 },
        content: { type: "string", minLength: 1 },
        excerpt: { type: "string", maxLength: 500 },
        featuredImage: { type: "string", format: "uri" },
        category: { type: "string", maxLength: 100 },
        businessId: { type: "string" },
        authorId: { type: "string" },
        status: { type: "string", enum: ["draft", "published"] },
        publishedAt: { type: "string", format: "date-time" },
        viewCount: { type: "number", minimum: 0, default: 0 },
        commentCount: { type: "number", minimum: 0, default: 0 },
        isActive: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
    },
    required: ["title", "slug", "content", "businessId"],
};
export const createBlogJsonSchema = {
    type: "object",
    properties: {
        title: { type: "string", minLength: 1, maxLength: 200 },
        slug: {
            type: "string",
            minLength: 1,
            maxLength: 200,
            pattern: "^[a-z0-9-]+$",
        },
        content: { type: "string", minLength: 1 },
        excerpt: { type: "string", maxLength: 500 },
        featuredImage: { type: "string", format: "uri" },
        contentImages: {
            type: "array",
            items: { type: "string", format: "uri" },
            maxItems: 5,
        },
        category: { type: "string", maxLength: 100 },
        businessId: { type: "string" },
        status: { type: "string", enum: ["draft", "published"], default: "draft" },
        isActive: { type: "boolean", default: true },
    },
    required: ["title", "slug", "content", "businessId"],
};
export const updateBlogJsonSchema = {
    type: "object",
    properties: {
        title: { type: "string", minLength: 1, maxLength: 200 },
        slug: {
            type: "string",
            minLength: 1,
            maxLength: 200,
            pattern: "^[a-z0-9-]+$",
        },
        content: { type: "string", minLength: 1 },
        excerpt: { type: "string", maxLength: 500 },
        featuredImage: { type: "string", format: "uri" },
        contentImages: {
            type: "array",
            items: { type: "string", format: "uri" },
            maxItems: 5,
        },
        category: { type: "string", maxLength: 100 },
        status: { type: "string", enum: ["draft", "published"] },
        isActive: { type: "boolean" },
    },
};
//# sourceMappingURL=blog.types.js.map