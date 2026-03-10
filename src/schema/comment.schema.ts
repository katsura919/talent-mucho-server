import { z } from "zod";
import {
  commentSchema,
  createCommentSchema,
  createCommentWithLeadSchema,
  updateCommentSchema,
  approveCommentSchema,
} from "../types/comment.types.js";

// Infer TypeScript types from Zod schemas
export type Comment = z.infer<typeof commentSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateCommentWithLeadInput = z.infer<
  typeof createCommentWithLeadSchema
>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type ApproveCommentInput = z.infer<typeof approveCommentSchema>;

// MongoDB document type (with ObjectId)
export interface CommentDocument {
  _id?: string;
  blogId: string;
  leadId: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Comment with populated lead information
export interface CommentWithLead extends CommentDocument {
  lead?: {
    _id: string;
    name: string;
    email: string;
  };
}
