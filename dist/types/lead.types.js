import { z } from "zod";
// Lead source enum
export const leadSourceEnum = z.enum(["blog_comment", "contact_form", "other"]);
// Lead status enum
export const leadStatusEnum = z.enum([
    "new",
    "contacted",
    "qualified",
    "converted",
]);
// Lead schema
export const leadSchema = z.object({
    _id: z.string().optional(),
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address").max(100),
    phone: z.string().min(1, "Phone number is required").max(20),
    source: leadSourceEnum.default("other"),
    status: leadStatusEnum.default("new"),
    notes: z.string().max(1000).optional(),
    isActive: z.boolean().default(true),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});
export const createLeadSchema = leadSchema.omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
});
export const updateLeadSchema = leadSchema
    .omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
})
    .partial();
export const updateLeadStatusSchema = z.object({
    status: leadStatusEnum,
});
// JSON Schemas
export const leadJsonSchema = {
    type: "object",
    properties: {
        _id: { type: "string" },
        name: { type: "string", minLength: 1, maxLength: 100 },
        email: { type: "string", format: "email", maxLength: 100 },
        phone: { type: "string", minLength: 1, maxLength: 20 },
        source: { type: "string", enum: ["blog_comment", "contact_form", "other"] },
        status: {
            type: "string",
            enum: ["new", "contacted", "qualified", "converted"],
        },
        notes: { type: "string", maxLength: 1000 },
        isActive: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
    },
    required: ["name", "email", "phone"],
};
export const createLeadJsonSchema = {
    type: "object",
    properties: {
        name: { type: "string", minLength: 1, maxLength: 100 },
        email: { type: "string", format: "email", maxLength: 100 },
        phone: { type: "string", minLength: 1, maxLength: 20 },
        source: {
            type: "string",
            enum: ["blog_comment", "contact_form", "other"],
            default: "other",
        },
        status: {
            type: "string",
            enum: ["new", "contacted", "qualified", "converted"],
            default: "new",
        },
        notes: { type: "string", maxLength: 1000 },
        isActive: { type: "boolean", default: true },
    },
    required: ["name", "email", "phone"],
};
export const updateLeadJsonSchema = {
    type: "object",
    properties: {
        name: { type: "string", minLength: 1, maxLength: 100 },
        email: { type: "string", format: "email", maxLength: 100 },
        phone: { type: "string", minLength: 1, maxLength: 20 },
        source: { type: "string", enum: ["blog_comment", "contact_form", "other"] },
        status: {
            type: "string",
            enum: ["new", "contacted", "qualified", "converted"],
        },
        notes: { type: "string", maxLength: 1000 },
        isActive: { type: "boolean" },
    },
};
export const updateLeadStatusJsonSchema = {
    type: "object",
    properties: {
        status: {
            type: "string",
            enum: ["new", "contacted", "qualified", "converted"],
        },
    },
    required: ["status"],
};
//# sourceMappingURL=lead.types.js.map