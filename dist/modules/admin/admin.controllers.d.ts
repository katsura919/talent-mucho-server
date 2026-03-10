import type { FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";
import { updateAdminSchema } from "../../types/admin.types.js";
import type { CreateAdmin, LoginRequest } from "../../types/admin.types.js";
import { z } from "zod";
export declare function loginAdmin(request: FastifyRequest<{
    Body: LoginRequest;
}>, reply: FastifyReply): Promise<{
    token: string;
    admin: {
        _id: string;
    };
}>;
export declare function getCurrentAdmin(request: FastifyRequest, reply: FastifyReply): Promise<{
    [key: string]: any;
    _id: ObjectId;
}>;
export declare function createAdmin(request: FastifyRequest<{
    Body: CreateAdmin;
}>, reply: FastifyReply): Promise<never>;
export declare function getAllAdmins(request: FastifyRequest, reply: FastifyReply): Promise<{
    _id: string;
}[]>;
export declare function getAdminById(request: FastifyRequest<{
    Params: {
        id: string;
    };
}>, reply: FastifyReply): Promise<{
    _id: string;
}>;
export declare function updateAdmin(request: FastifyRequest<{
    Params: {
        id: string;
    };
    Body: z.infer<typeof updateAdminSchema>;
}>, reply: FastifyReply): Promise<{
    _id: string;
}>;
export declare function deleteAdmin(request: FastifyRequest<{
    Params: {
        id: string;
    };
}>, reply: FastifyReply): Promise<{
    message: string;
}>;
//# sourceMappingURL=admin.controllers.d.ts.map