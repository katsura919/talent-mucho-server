import type { FastifyPluginAsync } from "fastify";
import {
  businessJsonSchema,
  createBusinessJsonSchema,
  updateBusinessJsonSchema,
} from "../../types/business.types.js";
import {
  getAllBusinesses,
  getBusinessById,
  getBusinessBySlug,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  uploadBusinessLogo,
} from "./business.controllers.js";

const businessRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /businesses - Get all businesses (public)
  fastify.get(
    "/businesses",
    {
      schema: {
        description: "Get all active businesses",
        tags: ["Businesses"],
        response: {
          200: {
            type: "array",
            items: businessJsonSchema,
          },
        },
      },
    },
    getAllBusinesses,
  );

  // GET /businesses/:id - Get business by ID
  fastify.get<{ Params: { id: string } }>(
    "/businesses/:id",
    {
      schema: {
        description: "Get a business by ID",
        tags: ["Businesses"],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Business ID (MongoDB ObjectId)",
            },
          },
          required: ["id"],
        },
        response: {
          200: businessJsonSchema,
          404: {
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    getBusinessById,
  );

  // GET /businesses/slug/:slug - Get business by slug (public)
  fastify.get<{ Params: { slug: string } }>(
    "/businesses/slug/:slug",
    {
      schema: {
        description: "Get a business by slug",
        tags: ["Businesses"],
        params: {
          type: "object",
          properties: {
            slug: { type: "string", description: "Business slug" },
          },
          required: ["slug"],
        },
        response: {
          200: businessJsonSchema,
          404: {
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    getBusinessBySlug,
  );

  // POST /businesses - Create business (protected)
  fastify.post(
    "/businesses",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Create a new business",
        tags: ["Businesses"],
        security: [{ bearerAuth: [] }],
        body: createBusinessJsonSchema,
        response: {
          201: businessJsonSchema,
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
          },
          409: {
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    createBusiness,
  );

  // PUT /businesses/:id - Update business (protected with business access check)
  fastify.put<{ Params: { id: string } }>(
    "/businesses/:id",
    {
      preHandler: [fastify.authenticate, fastify.authorizeBusinessAccess],
      schema: {
        description: "Update a business (requires access to the business)",
        tags: ["Businesses"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Business ID (MongoDB ObjectId)",
            },
          },
          required: ["id"],
        },
        body: updateBusinessJsonSchema,
        response: {
          200: businessJsonSchema,
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
    },
    updateBusiness,
  );

  // DELETE /businesses/:id - Soft delete business (protected with business access check)
  fastify.delete<{ Params: { id: string } }>(
    "/businesses/:id",
    {
      preHandler: [fastify.authenticate, fastify.authorizeBusinessAccess],
      schema: {
        description: "Soft delete a business (requires access to the business)",
        tags: ["Businesses"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Business ID (MongoDB ObjectId)",
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
    },
    deleteBusiness,
  );

  // POST /businesses/:id/logo - Upload business logo (protected)
  fastify.post<{ Params: { id: string } }>(
    "/businesses/:id/logo",
    {
      preHandler: [fastify.authenticate, fastify.authorizeBusinessAccess],
      schema: {
        description: "Upload a logo for a business (multipart/form-data)",
        tags: ["Businesses"],
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data"],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Business ID (MongoDB ObjectId)",
            },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              logo: { type: "string", format: "uri" },
              business: businessJsonSchema,
            },
          },
          400: {
            type: "object",
            properties: { error: { type: "string" } },
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
    },
    uploadBusinessLogo,
  );
};

export default businessRoutes;
