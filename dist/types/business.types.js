import { z } from "zod";
// Business schema
export const businessSchema = z.object({
    _id: z.string().optional(),
    name: z.string().min(1, "Business name is required").max(100),
    slug: z
        .string()
        .min(1, "Slug is required")
        .max(100)
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
    description: z.string().max(1000).optional(),
    logo: z.string().url().optional(),
    website: z.string().url().optional(),
    adminIds: z.array(z.string()).default([]),
    createdBy: z.string().optional(),
    isActive: z.boolean().default(true),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});
export const createBusinessSchema = businessSchema.omit({
    _id: true,
    adminIds: true,
    createdBy: true,
    createdAt: true,
    updatedAt: true,
});
export const updateBusinessSchema = createBusinessSchema.partial();
// JSON Schemas
export const businessJsonSchema = {
    type: "object",
    properties: {
        _id: { type: "string" },
        name: { type: "string", minLength: 1, maxLength: 100 },
        slug: { type: "string", minLength: 1, maxLength: 100 },
        description: { type: "string", maxLength: 1000 },
        logo: { type: "string", format: "uri" },
        website: { type: "string", format: "uri" },
        adminIds: { type: "array", items: { type: "string" } },
        createdBy: { type: "string" },
        isActive: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
    },
    required: ["name", "slug"],
};
export const createBusinessJsonSchema = {
    type: "object",
    properties: {
        name: { type: "string", minLength: 1, maxLength: 100 },
        slug: {
            type: "string",
            minLength: 1,
            maxLength: 100,
            pattern: "^[a-z0-9-]+$",
        },
        description: { type: "string", maxLength: 1000 },
        logo: { type: "string", format: "uri" },
        website: { type: "string", format: "uri" },
        isActive: { type: "boolean", default: true },
    },
    required: ["name", "slug"],
};
export const updateBusinessJsonSchema = {
    type: "object",
    properties: {
        name: { type: "string", minLength: 1, maxLength: 100 },
        slug: {
            type: "string",
            minLength: 1,
            maxLength: 100,
            pattern: "^[a-z0-9-]+$",
        },
        description: { type: "string", maxLength: 1000 },
        logo: { type: "string", format: "uri" },
        website: { type: "string", format: "uri" },
        isActive: { type: "boolean" },
    },
};
//# sourceMappingURL=business.types.js.map