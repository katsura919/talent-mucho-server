import { z } from "zod";

// Comment schema
export const commentSchema = z.object({
  _id: z.string().optional(),
  blogId: z.string().min(1, "Blog ID is required"),
  leadId: z.string().min(1, "Lead ID is required"),
  comment: z.string().min(1, "Comment is required").max(2000),
  isApproved: z.boolean().default(false),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const createCommentSchema = commentSchema.omit({
  _id: true,
  leadId: true, // Will be created/found from lead data
  createdAt: true,
  updatedAt: true,
});

export const createCommentWithLeadSchema = z.object({
  // Lead information
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").max(100),
  phone: z.string().min(1, "Phone number is required").max(20),
  // Comment information
  comment: z.string().min(1, "Comment is required").max(2000),
});

export const updateCommentSchema = z.object({
  comment: z.string().min(1, "Comment is required").max(2000).optional(),
  isApproved: z.boolean().optional(),
});

export const approveCommentSchema = z.object({
  isApproved: z.boolean(),
});

// JSON Schemas
export const commentJsonSchema = {
  type: "object",
  properties: {
    _id: { type: "string" },
    blogId: { type: "string" },
    leadId: { type: "string" },
    comment: { type: "string", minLength: 1, maxLength: 2000 },
    isApproved: { type: "boolean", default: false },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: ["blogId", "leadId", "comment"],
} as const;

export const createCommentWithLeadJsonSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1, maxLength: 100 },
    email: { type: "string", format: "email", maxLength: 100 },
    phone: { type: "string", minLength: 1, maxLength: 20 },
    comment: { type: "string", minLength: 1, maxLength: 2000 },
  },
  required: ["name", "email", "phone", "comment"],
} as const;

export const updateCommentJsonSchema = {
  type: "object",
  properties: {
    comment: { type: "string", minLength: 1, maxLength: 2000 },
    isApproved: { type: "boolean" },
  },
} as const;

export const approveCommentJsonSchema = {
  type: "object",
  properties: {
    isApproved: { type: "boolean" },
  },
  required: ["isApproved"],
} as const;
