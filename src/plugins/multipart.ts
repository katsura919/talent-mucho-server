import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import multipart from '@fastify/multipart';

const multipartPlugin: FastifyPluginAsync = async (fastify) => {
    await fastify.register(multipart, {
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB max file size
            files: 1, // Only allow 1 file per request
        },
    });

    fastify.log.info('📎 Multipart plugin registered successfully');
};

export default fp(multipartPlugin, {
    name: 'multipart',
});
