import type { FastifyPluginAsync } from "fastify";
import { type Transporter } from "nodemailer";
declare const _default: FastifyPluginAsync;
export default _default;
declare module "fastify" {
    interface FastifyInstance {
        mailer: Transporter;
    }
}
//# sourceMappingURL=nodemailer.d.ts.map