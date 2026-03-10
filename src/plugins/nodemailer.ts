import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import nodemailer, { type Transporter } from "nodemailer";

const nodemailerPlugin: FastifyPluginAsync = async (fastify) => {
  const transporter: Transporter = nodemailer.createTransport({
    host: fastify.config.SMTP_HOST,
    port: fastify.config.SMTP_PORT,
    secure: fastify.config.SMTP_SECURE, // true for 465, false for other ports
    auth: {
      user: fastify.config.SMTP_USER,
      pass: fastify.config.SMTP_PASS,
    },
  });

  // Decorate fastify instance with nodemailer transporter first
  fastify.decorate("mailer", transporter);

  // Verify transporter configuration (non-blocking)
  // This runs in the background and won't block plugin initialization
  transporter
    .verify()
    .then(() => {
      fastify.log.info("Nodemailer transporter is ready");
    })
    .catch((error) => {
      fastify.log.error(
        { err: error },
        "Nodemailer transporter verification failed",
      );
    });
};

export default fp(nodemailerPlugin, {
  name: "nodemailer",
  dependencies: ["env"],
});

// Extend FastifyInstance to include mailer
declare module "fastify" {
  interface FastifyInstance {
    mailer: Transporter;
  }
}
