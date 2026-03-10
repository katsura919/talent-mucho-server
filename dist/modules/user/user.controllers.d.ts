import type { FastifyRequest, FastifyReply } from 'fastify';
import { ObjectId } from '@fastify/mongodb';
import { z } from 'zod';
import { createUserSchema, updateUserSchema } from '../../types/user.types.js';
interface IdParams {
    id: string;
}
export declare function getAllUsers(request: FastifyRequest, reply: FastifyReply): Promise<{
    [key: string]: any;
    _id: ObjectId;
}[]>;
export declare function getUserById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    [key: string]: any;
    _id: ObjectId;
}>;
export declare function createUser(request: FastifyRequest<{
    Body: z.infer<typeof createUserSchema>;
}>, reply: FastifyReply): Promise<never>;
export declare function updateUser(request: FastifyRequest<{
    Params: IdParams;
    Body: z.infer<typeof updateUserSchema>;
}>, reply: FastifyReply): Promise<any>;
export declare function deleteUser(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<never>;
export declare function hardDeleteUser(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<never>;
export {};
//# sourceMappingURL=user.controllers.d.ts.map