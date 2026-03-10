import { bookingJsonSchema, updateBookingJsonSchema, } from "../../types/booking.types.js";
import { createBooking, getAllBookings, getBookingById, updateBooking, deleteBooking, getBookingsByBusinessId, } from "./booking.controllers.js";
const bookingRoutes = async (fastify) => {
    // POST /bookings - Create a new booking (public route)
    fastify.post("/bookings", {
        schema: {
            description: "Submit a free consultation booking request",
            tags: ["Bookings"],
            body: bookingJsonSchema,
            response: {
                201: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        bookingId: { type: "string" },
                    },
                },
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                    },
                },
            },
        },
    }, createBooking);
    // GET /bookings - Get all bookings (admin only - add auth later)
    fastify.get("/bookings", {
        schema: {
            description: "Get all booking requests",
            tags: ["Bookings"],
            response: {
                200: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            _id: { type: "string" },
                            businessId: { type: "string" },
                            fullName: { type: "string" },
                            email: { type: "string" },
                            companyName: { type: "string" },
                            message: { type: "string" },
                            status: { type: "string" },
                            createdAt: { type: "string" },
                            updatedAt: { type: "string" },
                        },
                    },
                },
            },
        },
    }, getAllBookings);
    // GET /bookings/:id - Get booking by ID (admin only - add auth later)
    fastify.get("/bookings/:id", {
        schema: {
            description: "Get a booking request by ID",
            tags: ["Bookings"],
            params: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Booking ID (MongoDB ObjectId)",
                    },
                },
                required: ["id"],
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        businessId: { type: "string" },
                        fullName: { type: "string" },
                        email: { type: "string" },
                        companyName: { type: "string" },
                        message: { type: "string" },
                        status: { type: "string" },
                        createdAt: { type: "string" },
                        updatedAt: { type: "string" },
                    },
                },
                404: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                    },
                },
            },
        },
    }, getBookingById);
    // PATCH /bookings/:id - Update booking (admin only - add auth later)
    fastify.patch("/bookings/:id", {
        schema: {
            description: "Update a booking request (e.g., change status)",
            tags: ["Bookings"],
            params: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Booking ID (MongoDB ObjectId)",
                    },
                },
                required: ["id"],
            },
            body: updateBookingJsonSchema,
            response: {
                200: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        booking: { type: "object" },
                    },
                },
                404: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                    },
                },
            },
        },
    }, updateBooking);
    // DELETE /bookings/:id - Delete booking (admin only - add auth later)
    fastify.delete("/bookings/:id", {
        schema: {
            description: "Delete a booking request",
            tags: ["Bookings"],
            params: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Booking ID (MongoDB ObjectId)",
                    },
                },
                required: ["id"],
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                    },
                },
                404: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                    },
                },
            },
        },
    }, deleteBooking);
    // GET /bookings/business/:businessId - Get bookings by business ID
    fastify.get("/bookings/business/:businessId", {
        schema: {
            description: "Get all booking requests for a specific business",
            tags: ["Bookings"],
            params: {
                type: "object",
                properties: {
                    businessId: {
                        type: "string",
                        description: "Business ID",
                    },
                },
                required: ["businessId"],
            },
            response: {
                200: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            _id: { type: "string" },
                            businessId: { type: "string" },
                            fullName: { type: "string" },
                            email: { type: "string" },
                            companyName: { type: "string" },
                            message: { type: "string" },
                            status: { type: "string" },
                            createdAt: { type: "string" },
                            updatedAt: { type: "string" },
                        },
                    },
                },
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                    },
                },
            },
        },
    }, getBookingsByBusinessId);
};
export default bookingRoutes;
//# sourceMappingURL=booking.routes.js.map