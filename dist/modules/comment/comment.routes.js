import { commentJsonSchema, createCommentWithLeadJsonSchema, updateCommentJsonSchema, approveCommentJsonSchema, } from "../../types/comment.types.js";
import { getCommentsBySlug, getAllComments, createComment, approveComment, updateComment, deleteComment, } from "./comment.controllers.js";
const commentRoutes = async (fastify) => {
    // GET /comments/blog/slug/:slug - Get approved comments for a blog by slug (public)
    fastify.get("/comments/blog/slug/:slug", {
        schema: {
            description: "Get approved comments for a blog by slug",
            tags: ["Comments"],
            params: {
                type: "object",
                properties: {
                    slug: { type: "string", description: "Blog slug" },
                },
                required: ["slug"],
            },
            querystring: {
                type: "object",
                properties: {
                    page: {
                        type: "number",
                        minimum: 1,
                        default: 1,
                        description: "Page number",
                    },
                    limit: {
                        type: "number",
                        minimum: 1,
                        maximum: 100,
                        default: 20,
                        description: "Items per page",
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
                                    comment: { type: "string" },
                                    createdAt: { type: "string" },
                                    lead: {
                                        type: "object",
                                        nullable: true,
                                        properties: {
                                            _id: { type: "string" },
                                            name: { type: "string" },
                                        },
                                    },
                                },
                            },
                        },
                        pagination: {
                            type: "object",
                            properties: {
                                page: { type: "number" },
                                limit: { type: "number" },
                                total: { type: "number" },
                                totalPages: { type: "number" },
                            },
                        },
                    },
                },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, getCommentsBySlug);
    // GET /comments - Get all comments with filters (admin)
    fastify.get("/comments", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Get all comments with optional filters and search",
            tags: ["Comments"],
            security: [{ bearerAuth: [] }],
            querystring: {
                type: "object",
                properties: {
                    blogId: {
                        type: "string",
                        description: "Filter by blog ID",
                    },
                    isApproved: {
                        type: "boolean",
                        description: "Filter by approval status",
                    },
                    search: {
                        type: "string",
                        description: "Search by comment text, lead name, or lead email",
                    },
                    page: {
                        type: "number",
                        minimum: 1,
                        default: 1,
                        description: "Page number",
                    },
                    limit: {
                        type: "number",
                        minimum: 1,
                        maximum: 100,
                        default: 20,
                        description: "Items per page",
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
                                    blogId: { type: "string" },
                                    comment: { type: "string" },
                                    isApproved: { type: "boolean" },
                                    createdAt: { type: "string" },
                                    updatedAt: { type: "string" },
                                    lead: {
                                        type: "object",
                                        nullable: true,
                                        properties: {
                                            _id: { type: "string" },
                                            name: { type: "string" },
                                            email: { type: "string" },
                                            phone: { type: "string" },
                                        },
                                    },
                                },
                            },
                        },
                        pagination: {
                            type: "object",
                            properties: {
                                page: { type: "number" },
                                limit: { type: "number" },
                                total: { type: "number" },
                                totalPages: { type: "number" },
                            },
                        },
                    },
                },
            },
        },
    }, getAllComments);
    // POST /comments/blog/slug/:slug - Create comment for a blog (public)
    fastify.post("/comments/blog/slug/:slug", {
        schema: {
            description: "Create a comment for a blog by slug",
            tags: ["Comments"],
            params: {
                type: "object",
                properties: {
                    slug: { type: "string", description: "Blog slug" },
                },
                required: ["slug"],
            },
            body: createCommentWithLeadJsonSchema,
            response: {
                200: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        blogId: { type: "string" },
                        leadId: { type: "string" },
                        comment: { type: "string" },
                        isApproved: { type: "boolean" },
                        createdAt: { type: "string" },
                        updatedAt: { type: "string" },
                        message: { type: "string" },
                    },
                },
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
            },
        },
    }, createComment);
    // PUT /comments/:id/approve - Approve/unapprove comment (admin)
    fastify.put("/comments/:id/approve", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Approve or unapprove a comment",
            tags: ["Comments"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Comment ID (MongoDB ObjectId)",
                    },
                },
                required: ["id"],
            },
            body: approveCommentJsonSchema,
            response: {
                200: commentJsonSchema,
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
            },
        },
    }, approveComment);
    // PUT /comments/:id - Update comment (admin)
    fastify.put("/comments/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Update a comment",
            tags: ["Comments"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Comment ID (MongoDB ObjectId)",
                    },
                },
                required: ["id"],
            },
            body: updateCommentJsonSchema,
            response: {
                200: commentJsonSchema,
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
            },
        },
    }, updateComment);
    // DELETE /comments/:id - Delete comment (admin)
    fastify.delete("/comments/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Delete a comment",
            tags: ["Comments"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Comment ID (MongoDB ObjectId)",
                    },
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
    }, deleteComment);
};
export default commentRoutes;
//# sourceMappingURL=comment.routes.js.map