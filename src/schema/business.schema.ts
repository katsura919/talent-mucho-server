import { z } from "zod";
import {
  businessSchema,
  createBusinessSchema,
  updateBusinessSchema,
} from "../types/business.types.js";

// Infer TypeScript types from Zod schemas
export type Business = z.infer<typeof businessSchema>;
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;

// MongoDB document type (with ObjectId)
export interface BusinessDocument {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  adminIds: string[];
  createdBy?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
