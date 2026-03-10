

import { z } from 'zod';

// Staff member schema for validation
export const userSchema = z.object({
    _id: z.string().optional(), // MongoDB ObjectId as string
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    position: z.string().min(1, 'Position is required').max(100),
    dateHired: z.string().datetime({ message: 'Invalid date format' }),
    isActive: z.boolean().default(true),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});

// Schema for creating a new user (without system fields)
export const createUserSchema = userSchema.omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
});

// Schema for updating a user (all fields optional)
export const updateUserSchema = createUserSchema.partial();

// JSON Schema for Fastify route validation
export const userJsonSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        firstName: { type: 'string', minLength: 1, maxLength: 50 },
        lastName: { type: 'string', minLength: 1, maxLength: 50 },
        email: { type: 'string', format: 'email' },
        position: { type: 'string', minLength: 1, maxLength: 100 },
        dateHired: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
    required: ['firstName', 'lastName', 'email', 'position', 'dateHired'],
} as const;

export const createUserJsonSchema = {
    type: 'object',
    properties: {
        firstName: { type: 'string', minLength: 1, maxLength: 50 },
        lastName: { type: 'string', minLength: 1, maxLength: 50 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
        position: { type: 'string', minLength: 1, maxLength: 100 },
        dateHired: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean', default: true },
    },
    required: ['firstName', 'lastName', 'email', 'password', 'position', 'dateHired'],
} as const;

export const updateUserJsonSchema = {
    type: 'object',
    properties: {
        firstName: { type: 'string', minLength: 1, maxLength: 50 },
        lastName: { type: 'string', minLength: 1, maxLength: 50 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
        position: { type: 'string', minLength: 1, maxLength: 100 },
        dateHired: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean' },
    },
} as const;
