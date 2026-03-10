import { z } from "zod";
import {
  blogSchema,
  createBlogSchema,
  updateBlogSchema,
} from "../types/blog.types.js";

// Infer TypeScript types from Zod schemas
export type Blog = z.infer<typeof blogSchema>;
export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;

// MongoDB document type (with ObjectId)
export interface BlogDocument {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  contentImages?: string[];
  category?: string;
  businessId: string;
  authorId: string;
  status: "draft" | "published";
  publishedAt?: string;
  viewCount: number;
  commentCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
