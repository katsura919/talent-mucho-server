import { z } from 'zod';
import { userSchema, createUserSchema, updateUserSchema } from '../types/user.types.js';

// Infer TypeScript types from Zod schemas
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// MongoDB document type (with ObjectId)
export interface UserDocument {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    position: string;
    dateHired: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

