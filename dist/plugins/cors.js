import fp from 'fastify-plugin';
import cors from '@fastify/cors';
const corsPlugin = async (fastify) => {
    const origins = fastify.config.CORS_ORIGIN.split(',').map((origin) => origin.trim());
    await fastify.register(cors, {
        origin: fastify.config.NODE_ENV === 'development' ? true : origins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
};
export default fp(corsPlugin, {
    name: 'cors',
    dependencies: ['env'],
});
//# sourceMappingURL=cors.js.map