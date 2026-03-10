import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import mongodb from '@fastify/mongodb';

const mongodbPlugin: FastifyPluginAsync = async (fastify) => {
    await fastify.register(mongodb, {
        forceClose: true,
        url: fastify.config.MONGODB_URI,
        database: 'avsph', // Explicit database name
    });

    fastify.log.info('🍃 MongoDB connected successfully');
};

export default fp(mongodbPlugin, {
    name: 'mongodb',
    dependencies: ['env'], // Ensure env plugin is loaded first
});
