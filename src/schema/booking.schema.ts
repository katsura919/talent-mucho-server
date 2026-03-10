import { z } from "zod";
import {
  bookingSchema,
  createBookingSchema,
  updateBookingSchema,
} from "../types/booking.types.js";

// Infer TypeScript types from Zod schemas
export type Booking = z.infer<typeof bookingSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

// MongoDB document type (with ObjectId)
export interface BookingDocument {
  _id?: string;
  businessId: string;
  fullName: string;
  email: string;
  companyName?: string;
  message: string;
  status: "pending" | "contacted" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}
