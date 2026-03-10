import type { FastifyPluginAsync } from "fastify";
import {
  adminJsonSchema,
  createAdminJsonSchema,
  updateAdminJsonSchema,
  loginJsonSchema,
  loginResponseJsonSchema,
} from "../../types/admin.types.js";
import {
  loginAdmin,
  getCurrentAdmin,
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from "./admin.controllers.js";

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /admin/login - Login
  fastify.post(
    "/admin/login",
    {
      schema: {
        description: "Admin login",
        tags: ["Admin"],
        body: loginJsonSchema,
        response: {
          200: loginResponseJsonSchema,
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
          },
          401: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    loginAdmin,
  );

  // GET /admin/me - Get current admin (protected)
  fastify.get(
    "/admin/me",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Get current authenticated admin",
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        response: {
          200: adminJsonSchema,
          401: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    getCurrentAdmin,
  );

  // POST /admin/register - Create admin (for initial setup)
  fastify.post(
    "/admin/register",
    {
      schema: {
        description:
          "Register a new admin (first admin becomes super-admin, subsequent registrations require super-admin auth)",
        tags: ["Admin"],
        body: createAdminJsonSchema,
        response: {
          201: adminJsonSchema,
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
          },
          409: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    createAdmin,
  );

  // GET /admin/admins - Get all admins (super-admin only)
  fastify.get(
    "/admin/admins",
    {
      preHandler: [fastify.requireSuperAdmin],
      schema: {
        description: "Get all admins (super-admin only)",
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "array",
            items: adminJsonSchema,
          },
        },
      },
    },
    getAllAdmins,
  );

  // GET /admin/admins/:id - Get admin by ID (super-admin only)
  fastify.get<{ Params: { id: string } }>(
    "/admin/admins/:id",
    {
      preHandler: [fastify.requireSuperAdmin],
      schema: {
        description: "Get admin by ID (super-admin only)",
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "Admin ID" },
          },
          required: ["id"],
        },
        response: {
          200: adminJsonSchema,
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    getAdminById,
  );

  // PUT /admin/admins/:id - Update admin (super-admin only)
  fastify.put<{
    Params: { id: string };
    Body: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: "super-admin" | "admin";
      businessIds?: string[];
      isActive?: boolean;
    };
  }>(
    "/admin/admins/:id",
    {
      preHandler: [fastify.requireSuperAdmin],
      schema: {
        description:
          "Update admin details including business assignments (super-admin only)",
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "Admin ID" },
          },
          required: ["id"],
        },
        body: updateAdminJsonSchema,
        response: {
          200: adminJsonSchema,
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    updateAdmin,
  );

  // DELETE /admin/admins/:id - Delete admin (super-admin only)
  fastify.delete<{ Params: { id: string } }>(
    "/admin/admins/:id",
    {
      preHandler: [fastify.requireSuperAdmin],
      schema: {
        description: "Soft delete admin (super-admin only)",
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "Admin ID" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    deleteAdmin,
  );
};

export default adminRoutes;
