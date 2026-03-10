import { z } from "zod";
export declare const businessSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    adminIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    createdBy: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    adminIds: string[];
    isActive: boolean;
    slug: string;
    description?: string | undefined;
    _id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    logo?: string | undefined;
    website?: string | undefined;
    createdBy?: string | undefined;
}, {
    name: string;
    slug: string;
    description?: string | undefined;
    _id?: string | undefined;
    adminIds?: string[] | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    logo?: string | undefined;
    website?: string | undefined;
    createdBy?: string | undefined;
}>;
export declare const createBusinessSchema: z.ZodObject<Omit<{
    _id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    adminIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    createdBy: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "_id" | "adminIds" | "createdAt" | "updatedAt" | "createdBy">, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    slug: string;
    description?: string | undefined;
    logo?: string | undefined;
    website?: string | undefined;
}, {
    name: string;
    slug: string;
    description?: string | undefined;
    isActive?: boolean | undefined;
    logo?: string | undefined;
    website?: string | undefined;
}>;
export declare const updateBusinessSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    name: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    slug: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    website: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    name?: string | undefined;
    isActive?: boolean | undefined;
    slug?: string | undefined;
    logo?: string | undefined;
    website?: string | undefined;
}, {
    description?: string | undefined;
    name?: string | undefined;
    isActive?: boolean | undefined;
    slug?: string | undefined;
    logo?: string | undefined;
    website?: string | undefined;
}>;
export declare const businessJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly _id: {
            readonly type: "string";
        };
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly slug: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly description: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
        readonly logo: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly website: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly adminIds: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly createdBy: {
            readonly type: "string";
        };
        readonly isActive: {
            readonly type: "boolean";
        };
        readonly createdAt: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly updatedAt: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
    readonly required: readonly ["name", "slug"];
};
export declare const createBusinessJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly slug: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
            readonly pattern: "^[a-z0-9-]+$";
        };
        readonly description: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
        readonly logo: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly website: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly isActive: {
            readonly type: "boolean";
            readonly default: true;
        };
    };
    readonly required: readonly ["name", "slug"];
};
export declare const updateBusinessJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly slug: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
            readonly pattern: "^[a-z0-9-]+$";
        };
        readonly description: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
        readonly logo: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly website: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly isActive: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=business.types.d.ts.map