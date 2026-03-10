import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { config } from 'dotenv';
import { envSchema } from '../config/env.js';

// Load .env file
config();

const envPlugin: FastifyPluginAsync = async (fastify) => {
    // Parse and validate environment variables with Zod
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        fastify.log.error('Invalid environment variables:');
        parsed.error.errors.forEach((error) => {
            fastify.log.error(`  ${error.path.join('.')}: ${error.message}`);
        });
        throw new Error('Invalid environment configuration');
    }

    // Decorate fastify instance with validated config
    fastify.decorate('config', parsed.data);
};

export default fp(envPlugin, {
    name: 'env',
});
