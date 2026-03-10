import fp from 'fastify-plugin';
import mongodb from '@fastify/mongodb';
const mongodbPlugin = async (fastify) => {
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
//# sourceMappingURL=mongodb.js.map