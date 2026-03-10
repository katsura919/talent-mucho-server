import type { FastifyPluginAsync } from 'fastify';
import {
    userJsonSchema,
    createUserJsonSchema,
    updateUserJsonSchema,
} from '../../types/user.types.js';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    hardDeleteUser,
} from './user.controllers.js';

const userRoutes: FastifyPluginAsync = async (fastify) => {
    
    // GET /users - Get all users
    fastify.get('/users', {
        schema: {
            description: 'Get all active staff members',
            tags: ['Users'],
            response: {
                200: {
                    type: 'array',
                    items: userJsonSchema,
                },
            },
        },
    }, getAllUsers);

    // GET /users/:id - Get user by ID
    fastify.get<{ Params: { id: string } }>('/users/:id', {
        schema: {
            description: 'Get a staff member by ID',
            tags: ['Users'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'User ID (MongoDB ObjectId)' },
                },
                required: ['id'],
            },
            response: {
                200: userJsonSchema,
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                    },
                },
            },
        },
    }, getUserById);

    // POST /users - Create a new user
    fastify.post('/users', {
        schema: {
            description: 'Create a new staff member',
            tags: ['Users'],
            body: createUserJsonSchema,
            response: {
                201: userJsonSchema,
                400: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        details: { type: 'array' },
                    },
                },
                409: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                    },
                },
            },
        },
    }, createUser);

    // PUT /users/:id - Update a user
    fastify.put<{ Params: { id: string }; Body: { firstName?: string; lastName?: string; email?: string; position?: string; dateHired?: string; isActive?: boolean } }>('/users/:id', {
        schema: {
            description: 'Update a staff member',
            tags: ['Users'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'User ID (MongoDB ObjectId)' },
                },
                required: ['id'],
            },
            body: updateUserJsonSchema,
            response: {
                200: userJsonSchema,
                400: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        details: { type: 'array' },
                    },
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                    },
                },
                409: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                    },
                },
            },
        },
    }, updateUser);

    // DELETE /users/:id - Soft delete a user
    fastify.delete<{ Params: { id: string } }>('/users/:id', {
        schema: {
            description: 'Soft delete a staff member (sets isActive to false)',
            tags: ['Users'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'User ID (MongoDB ObjectId)' },
                },
                required: ['id'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                    },
                },
            },
        },
    }, deleteUser);

    // DELETE /users/:id/permanent - Hard delete a user
    fastify.delete<{ Params: { id: string } }>('/users/:id/permanent', {
        schema: {
            description: 'Permanently delete a staff member',
            tags: ['Users'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'User ID (MongoDB ObjectId)' },
                },
                required: ['id'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                    },
                },
            },
        },
    }, hardDeleteUser);
};

export default userRoutes;
