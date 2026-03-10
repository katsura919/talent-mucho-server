import { z } from 'zod';
import { userSchema, createUserSchema, updateUserSchema } from '../types/user.types.js';
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
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
//# sourceMappingURL=users.d.ts.map