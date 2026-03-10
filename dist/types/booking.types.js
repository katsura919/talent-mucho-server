import { z } from "zod";
// Booking schema for validation
export const bookingSchema = z.object({
    _id: z.string().optional(), // MongoDB ObjectId as string
    businessId: z.string().min(1, "Business ID is required"),
    fullName: z.string().min(1, "Full name is required").max(100),
    email: z.string().email("Invalid email address"),
    companyName: z.string().max(100).optional(),
    message: z.string().min(1, "Message is required").max(1000),
    status: z
        .enum(["pending", "contacted", "completed", "cancelled"])
        .default("pending"),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});
// Schema for creating a new booking (without system fields)
export const createBookingSchema = bookingSchema.omit({
    _id: true,
    status: true,
    createdAt: true,
    updatedAt: true,
});
// Schema for updating a booking
export const updateBookingSchema = bookingSchema
    .omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
})
    .partial();
// JSON Schema for Fastify route validation
export const bookingJsonSchema = {
    type: "object",
    properties: {
        businessId: { type: "string", minLength: 1 },
        fullName: { type: "string", minLength: 1, maxLength: 100 },
        email: { type: "string", format: "email" },
        companyName: { type: "string", maxLength: 100 },
        message: { type: "string", minLength: 1, maxLength: 1000 },
    },
    required: ["businessId", "fullName", "email", "message"],
};
export const updateBookingJsonSchema = {
    type: "object",
    properties: {
        businessId: { type: "string", minLength: 1 },
        fullName: { type: "string", minLength: 1, maxLength: 100 },
        email: { type: "string", format: "email" },
        companyName: { type: "string", maxLength: 100 },
        message: { type: "string", minLength: 1, maxLength: 1000 },
        status: {
            type: "string",
            enum: ["pending", "contacted", "completed", "cancelled"],
        },
    },
};
//# sourceMappingURL=booking.types.js.map