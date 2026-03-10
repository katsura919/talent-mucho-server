import { blogJsonSchema, createBlogJsonSchema, updateBlogJsonSchema, } from "../../types/blog.types.js";
import { getAllBlogs, getBlogById, getBlogBySlug, getPublicBlogs, getBlogsByBusiness, createBlog, updateBlog, deleteBlog, uploadBlogFeaturedImage, uploadBlogContentImage, incrementBlogView, } from "./blog.controllers.js";
const blogRoutes = async (fastify) => {
    // GET /blogs - Get all blogs (with optional filters)
    fastify.get("/blogs", {
        schema: {
            description: "Get all blogs with optional filters",
            tags: ["Blogs"],
            querystring: {
                type: "object",
                properties: {
                    businessId: {
                        type: "string",
                        description: "Filter by business ID",
                    },
                    status: {
                        type: "string",
                        enum: ["draft", "published"],
                        description: "Filter by status",
                    },
                    category: {
                        type: "string",
                        description: "Filter by category",
                    },
                },
            },
            response: {
                200: {
                    type: "array",
                    items: blogJsonSchema,
                },
            },
        },
    }, getAllBlogs);
    // GET /blogs/:id - Get blog by ID
    fastify.get("/blogs/:id", {
        schema: {
            description: "Get a blog by ID",
            tags: ["Blogs"],
            params: {
                type: "object",
                properties: {
                    id: { type: "string", description: "Blog ID (MongoDB ObjectId)" },
                },
                required: ["id"],
            },
            response: {
                200: blogJsonSchema,
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, getBlogById);
    // GET /blogs/slug/:slug - Get blog by slug (public)
    fastify.get("/blogs/slug/:slug", {
        schema: {
            description: "Get a published blog by slug",
            tags: ["Blogs"],
            params: {
                type: "object",
                properties: {
                    slug: { type: "string", description: "Blog slug" },
                },
                required: ["slug"],
            },
            response: {
                200: blogJsonSchema,
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, getBlogBySlug);
    // GET /blogs/public - Get public blogs for landing page (minimal fields)
    fastify.get("/blogs/public", {
        schema: {
            description: "Get public blogs for landing page with minimal fields (title, featuredImage, category, slug, createdAt)",
            tags: ["Blogs"],
            querystring: {
                type: "object",
                properties: {
                    businessId: {
                        type: "string",
                        description: "Filter by business ID",
                    },
                    category: {
                        type: "string",
                        description: "Filter by category",
                    },
                    page: {
                        type: "string",
                        default: "1",
                        description: "Page number",
                    },
                    limit: {
                        type: "string",
                        default: "10",
                        description: "Number of items per page (max 50)",
                    },
                },
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        data: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    _id: { type: "string" },
                                    title: { type: "string" },
                                    featuredImage: { type: "string" },
                                    category: { type: "string" },
                                    slug: { type: "string" },
                                    createdAt: { type: "string" },
                                },
                            },
                        },
                        pagination: {
                            type: "object",
                            properties: {
                                page: { type: "number" },
                                limit: { type: "number" },
                                totalItems: { type: "number" },
                                totalPages: { type: "number" },
                                hasNextPage: { type: "boolean" },
                                hasPrevPage: { type: "boolean" },
                            },
                        },
                    },
                },
            },
        },
    }, getPublicBlogs);
    // GET /businesses/:businessId/blogs - Get blogs by business
    fastify.get("/businesses/:businessId/blogs", {
        schema: {
            description: "Get all blogs for a business with search, pagination, and filtering",
            tags: ["Blogs"],
            params: {
                type: "object",
                properties: {
                    businessId: {
                        type: "string",
                        description: "Business ID (MongoDB ObjectId)",
                    },
                },
                required: ["businessId"],
            },
            querystring: {
                type: "object",
                properties: {
                    search: {
                        type: "string",
                        description: "Search term for title, excerpt, or slug",
                    },
                    page: {
                        type: "string",
                        default: "1",
                        description: "Page number",
                    },
                    limit: {
                        type: "string",
                        default: "10",
                        description: "Number of items per page",
                    },
                    status: {
                        type: "string",
                        enum: ["draft", "published", "all"],
                        default: "all",
                        description: "Filter by blog status",
                    },
                },
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        data: {
                            type: "array",
                            items: blogJsonSchema,
                        },
                        pagination: {
                            type: "object",
                            properties: {
                                page: { type: "number" },
                                limit: { type: "number" },
                                totalItems: { type: "number" },
                                totalPages: { type: "number" },
                                hasNextPage: { type: "boolean" },
                                hasPrevPage: { type: "boolean" },
                            },
                        },
                    },
                },
            },
        },
    }, getBlogsByBusiness);
    // POST /blogs - Create blog (protected with business access check)
    fastify.post("/blogs", {
        preHandler: [fastify.authenticate, fastify.authorizeBusinessAccess],
        schema: {
            description: "Create a new blog (requires access to the business)",
            tags: ["Blogs"],
            security: [{ bearerAuth: [] }],
            body: createBlogJsonSchema,
            response: {
                201: blogJsonSchema,
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        details: { type: "array" },
                    },
                },
                403: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        message: { type: "string" },
                    },
                },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
                409: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, createBlog);
    // PUT /blogs/:id - Update blog (protected with business access check)
    fastify.put("/blogs/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Update a blog",
            tags: ["Blogs"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: { type: "string", description: "Blog ID (MongoDB ObjectId)" },
                },
                required: ["id"],
            },
            body: updateBlogJsonSchema,
            response: {
                200: blogJsonSchema,
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        details: { type: "array" },
                    },
                },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
                409: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, updateBlog);
    // DELETE /blogs/:id - Soft delete blog (protected)
    fastify.delete("/blogs/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Soft delete a blog",
            tags: ["Blogs"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: { type: "string", description: "Blog ID (MongoDB ObjectId)" },
                },
                required: ["id"],
            },
            response: {
                200: {
                    type: "object",
                    properties: { message: { type: "string" } },
                },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, deleteBlog);
    // POST /blogs/:id/featured-image - Upload blog featured image (protected)
    fastify.post("/blogs/:id/featured-image", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Upload a featured image for a blog (multipart/form-data)",
            tags: ["Blogs"],
            security: [{ bearerAuth: [] }],
            consumes: ["multipart/form-data"],
            params: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Blog ID (MongoDB ObjectId)",
                    },
                },
                required: ["id"],
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        featuredImage: { type: "string", format: "uri" },
                        blog: blogJsonSchema,
                    },
                },
                400: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
                403: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        message: { type: "string" },
                    },
                },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
                500: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        message: { type: "string" },
                    },
                },
            },
        },
    }, uploadBlogFeaturedImage);
    // POST /blogs/:id/upload-content-image - Upload a content image (authenticated)
    fastify.post("/blogs/:id/upload-content-image", {
        onRequest: [fastify.authenticate],
        schema: {
            description: "Upload a content image for a blog post",
            tags: ["Blogs"],
            consumes: ["multipart/form-data"],
            params: {
                type: "object",
                properties: {
                    id: { type: "string", description: "Blog ID (MongoDB ObjectId)" },
                },
                required: ["id"],
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        url: { type: "string" },
                        blog: blogJsonSchema,
                    },
                },
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        message: { type: "string" },
                    },
                },
                403: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        message: { type: "string" },
                    },
                },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
                500: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        message: { type: "string" },
                    },
                },
            },
        },
    }, uploadBlogContentImage);
    // POST /blogs/slug/:slug/view - Increment blog view count (public)
    fastify.post("/blogs/slug/:slug/view", {
        schema: {
            description: "Increment view count for a blog",
            tags: ["Blogs"],
            params: {
                type: "object",
                properties: {
                    slug: { type: "string", description: "Blog slug" },
                },
                required: ["slug"],
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        viewCount: { type: "number" },
                    },
                },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, incrementBlogView);
};
export default blogRoutes;
//# sourceMappingURL=blog.routes.js.map