import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    authenticateStaff: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    requireSuperAdmin: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    authorizeBusinessAccess: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string; email: string; role: string; userType?: 'admin' | 'staff'; businessId?: string };
    user: { id: string; email: string; role: string; userType?: 'admin' | 'staff'; businessId?: string };
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  const secret = fastify.config.JWT_SECRET;

  await fastify.register(jwt, {
    secret,
    sign: {
      expiresIn: "7d",
    },
  });

  // Authenticate any user (admin or staff)
  fastify.decorate(
    "authenticate",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply
          .status(401)
          .send({ error: "Unauthorized", message: "Invalid or expired token" });
      }
    },
  );

  // Authenticate staff only
  fastify.decorate(
    "authenticateStaff",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();

        if (request.user.userType !== "staff") {
          reply.status(403).send({
            error: "Forbidden",
            message: "This action requires staff authentication",
          });
        }
      } catch (err) {
        reply
          .status(401)
          .send({ error: "Unauthorized", message: "Invalid or expired token" });
      }
    },
  );

  // Middleware to check if user is super-admin
  fastify.decorate(
    "requireSuperAdmin",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();

        if (request.user.role !== "super-admin") {
          reply.status(403).send({
            error: "Forbidden",
            message: "This action requires super-admin privileges",
          });
        }
      } catch (err) {
        reply
          .status(401)
          .send({ error: "Unauthorized", message: "Invalid or expired token" });
      }
    },
  );

  // Middleware to check if admin has access to a specific business
  fastify.decorate(
    "authorizeBusinessAccess",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();

        // Super-admins have access to all businesses
        if (request.user.role === "super-admin") {
          return;
        }

        // Get businessId from params or body
        const businessId =
          (request.params as { id?: string; businessId?: string }).id ||
          (request.params as { id?: string; businessId?: string }).businessId ||
          (request.body as { businessId?: string })?.businessId;

        if (!businessId) {
          reply.status(400).send({
            error: "Bad Request",
            message: "Business ID is required",
          });
          return;
        }

        // Validate ObjectId format
        if (!ObjectId.isValid(businessId)) {
          reply.status(400).send({ error: "Invalid business ID format" });
          return;
        }

        // Check if business exists and admin has access
        const businesses = fastify.mongo.db?.collection("businesses");
        if (!businesses) {
          reply.status(500).send({ error: "Database not available" });
          return;
        }

        const business = await businesses.findOne({
          _id: new ObjectId(businessId),
          adminIds: request.user.id,
        });

        if (!business) {
          reply.status(403).send({
            error: "Forbidden",
            message: "You do not have access to this business",
          });
          return;
        }
      } catch (err) {
        reply
          .status(401)
          .send({ error: "Unauthorized", message: "Invalid or expired token" });
      }
    },
  );
};

export default fp(authPlugin, {
  name: "auth",
  dependencies: ["env"],
});

