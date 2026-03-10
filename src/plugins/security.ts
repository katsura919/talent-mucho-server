import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';
import type { FastifyPluginAsync } from 'fastify';

const securityPlugin: FastifyPluginAsync = async (fastify) => {
    await fastify.register(helmet, {
        contentSecurityPolicy: fastify.config.NODE_ENV === 'production',
        crossOriginEmbedderPolicy: false,
    });
};

export default fp(securityPlugin, {
    name: 'security',
    dependencies: ['env'],
});
