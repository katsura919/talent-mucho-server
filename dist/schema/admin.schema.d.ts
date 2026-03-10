import { z } from "zod";
import { adminSchema, createAdminSchema, loginSchema } from "../types/admin.types.js";
export type Admin = z.infer<typeof adminSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export interface AdminDocument {
    _id?: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: "super-admin" | "admin";
    businessIds: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=admin.schema.d.ts.map