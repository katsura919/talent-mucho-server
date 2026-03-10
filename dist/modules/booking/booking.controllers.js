import { ObjectId } from "@fastify/mongodb";
import { createBookingSchema, updateBookingSchema, } from "../../types/booking.types.js";
import { getBookingConfirmationEmail } from "../../utils/emails/booking.email.js";
// Create a new booking
export async function createBooking(request, reply) {
    const bookings = request.server.mongo.db?.collection("bookings");
    if (!bookings) {
        return reply.status(500).send({ error: "Database not available" });
    }
    try {
        // Validate request body with Zod
        const validatedData = createBookingSchema.parse(request.body);
        const now = new Date().toISOString();
        const bookingData = {
            ...validatedData,
            status: "pending",
            createdAt: now,
            updatedAt: now,
        };
        // Insert booking into database
        const result = await bookings.insertOne(bookingData);
        // Send confirmation email to client
        try {
            // Fetch business name if businessId is provided
            let businessName;
            if (validatedData.businessId) {
                const businesses = request.server.mongo.db?.collection("businesses");
                if (businesses && ObjectId.isValid(validatedData.businessId)) {
                    const business = await businesses.findOne({
                        _id: new ObjectId(validatedData.businessId),
                    });
                    businessName = business?.name;
                }
            }
            const emailHtml = getBookingConfirmationEmail(validatedData.fullName, validatedData.companyName, businessName);
            await request.server.mailer.sendMail({
                from: request.server.config.SMTP_FROM || request.server.config.SMTP_USER,
                to: validatedData.email,
                subject: "✓ Your Free Consultation Request is Confirmed",
                html: emailHtml,
            });
            request.log.info(`Booking confirmation email sent to ${validatedData.email}`);
        }
        catch (emailError) {
            // Log email error but don't fail the booking
            request.log.error({ err: emailError }, "Failed to send confirmation email");
        }
        return reply.status(201).send({
            message: "Booking created successfully",
            bookingId: result.insertedId.toString(),
        });
    }
    catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
            return reply
                .status(400)
                .send({ error: "Invalid booking data", details: error });
        }
        request.log.error({ err: error }, "Error creating booking");
        return reply.status(500).send({ error: "Failed to create booking" });
    }
}
// Get all bookings (admin only)
export async function getAllBookings(request, reply) {
    const bookings = request.server.mongo.db?.collection("bookings");
    if (!bookings) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const result = await bookings.find({}).sort({ createdAt: -1 }).toArray();
    return result;
}
// Get booking by ID
export async function getBookingById(request, reply) {
    const bookings = request.server.mongo.db?.collection("bookings");
    if (!bookings) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid booking ID format" });
    }
    const booking = await bookings.findOne({ _id: new ObjectId(id) });
    if (!booking) {
        return reply.status(404).send({ error: "Booking not found" });
    }
    return booking;
}
// Update booking (admin only - for changing status)
export async function updateBooking(request, reply) {
    const bookings = request.server.mongo.db?.collection("bookings");
    if (!bookings) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid booking ID format" });
    }
    try {
        const validatedData = updateBookingSchema.parse(request.body);
        const updateData = {
            ...validatedData,
            updatedAt: new Date().toISOString(),
        };
        const result = await bookings.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateData }, { returnDocument: "after" });
        if (!result) {
            return reply.status(404).send({ error: "Booking not found" });
        }
        return reply.send({
            message: "Booking updated successfully",
            booking: result,
        });
    }
    catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
            return reply
                .status(400)
                .send({ error: "Invalid update data", details: error });
        }
        request.log.error({ err: error }, "Error updating booking");
        return reply.status(500).send({ error: "Failed to update booking" });
    }
}
// Delete booking (admin only)
export async function deleteBooking(request, reply) {
    const bookings = request.server.mongo.db?.collection("bookings");
    if (!bookings) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid booking ID format" });
    }
    const result = await bookings.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
        return reply.status(404).send({ error: "Booking not found" });
    }
    return reply.send({ message: "Booking deleted successfully" });
}
// Get bookings by business ID
export async function getBookingsByBusinessId(request, reply) {
    const bookings = request.server.mongo.db?.collection("bookings");
    if (!bookings) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { businessId } = request.params;
    if (!businessId) {
        return reply.status(400).send({ error: "Business ID is required" });
    }
    const result = await bookings
        .find({ businessId })
        .sort({ createdAt: -1 })
        .toArray();
    return result;
}
//# sourceMappingURL=booking.controllers.js.map