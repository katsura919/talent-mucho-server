import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

const swaggerPlugin: FastifyPluginAsync = async (fastify) => {
    await fastify.register(swagger, {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'AVSPH API',
                description: 'Advanced Virtual Staff PH - Staffing Agency API',
                version: '1.0.0',
            },
            tags: [
                { name: 'Health', description: 'Health check endpoints' },
                { name: 'Admin', description: 'Admin authentication' },
                { name: 'Users', description: 'Staff member management' },
                { name: 'Businesses', description: 'Business management' },
                { name: 'Blogs', description: 'Blog management' },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
        },
    });

    await fastify.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
        },
        staticCSP: true,
    });

    fastify.log.info('📖 Swagger docs available at /docs');
};

export default fp(swaggerPlugin, {
    name: 'swagger',
    dependencies: ['env'],
});
