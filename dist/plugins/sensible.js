import fp from 'fastify-plugin';
import sensible from '@fastify/sensible';
const sensiblePlugin = async (fastify) => {
    await fastify.register(sensible, {
        sharedSchemaId: 'HttpError',
    });
};
export default fp(sensiblePlugin, {
    name: 'sensible',
});
//# sourceMappingURL=sensible.js.map