import { ObjectId } from "@fastify/mongodb";
import { clockInSchema, clockOutSchema, approveAttendanceSchema, editAttendanceSchema, } from "../../types/attendance.types.js";
// ==================== STAFF ACTIONS ====================
// Clock in (staff only)
export async function clockIn(request, reply) {
    const attendance = request.server.mongo.db?.collection("attendance");
    const staff = request.server.mongo.db?.collection("staff");
    if (!attendance || !staff) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id: staffId, businessId } = request.user;
    if (!staffId || !businessId) {
        return reply.status(400).send({ error: "Invalid staff token" });
    }
    // Verify staff exists and is active
    const staffMember = await staff.findOne({
        _id: new ObjectId(staffId),
        isActive: true,
        status: "active",
    });
    if (!staffMember) {
        return reply.status(404).send({ error: "Staff member not found or inactive" });
    }
    // Check if already clocked in (has an open attendance record)
    const existingAttendance = await attendance.findOne({
        staffId,
        businessId,
        clockOut: { $exists: false },
        isActive: true,
    });
    if (existingAttendance) {
        return reply.status(409).send({
            error: "Already clocked in",
            message: "You must clock out before clocking in again",
            attendanceId: existingAttendance._id,
        });
    }
    const parseResult = clockInSchema.safeParse(request.body);
    const notes = parseResult.success ? parseResult.data.notes : undefined;
    const now = new Date();
    const nowISO = now.toISOString();
    // workDate is the business day this shift belongs to (YYYY-MM-DD format)
    const workDate = now.toISOString().split('T')[0];
    const newAttendance = {
        staffId,
        businessId,
        clockIn: nowISO,
        workDate,
        status: "pending",
        notes,
        isActive: true,
        createdAt: nowISO,
        updatedAt: nowISO,
    };
    const result = await attendance.insertOne(newAttendance);
    return reply.status(201).send({
        _id: result.insertedId,
        ...newAttendance,
        message: "Clocked in successfully",
    });
}
// Clock out (staff only)
export async function clockOut(request, reply) {
    const attendance = request.server.mongo.db?.collection("attendance");
    if (!attendance) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id: staffId, businessId } = request.user;
    if (!staffId || !businessId) {
        return reply.status(400).send({ error: "Invalid staff token" });
    }
    // Find the open attendance record
    const existingAttendance = await attendance.findOne({
        staffId,
        businessId,
        clockOut: { $exists: false },
        isActive: true,
    });
    if (!existingAttendance) {
        return reply.status(404).send({
            error: "Not clocked in",
            message: "You must clock in before clocking out",
        });
    }
    const parseResult = clockOutSchema.safeParse(request.body);
    const notes = parseResult.success && parseResult.data.notes
        ? (existingAttendance.notes ? `${existingAttendance.notes}\n${parseResult.data.notes}` : parseResult.data.notes)
        : existingAttendance.notes;
    const now = new Date();
    const clockInTime = new Date(existingAttendance.clockIn);
    const hoursWorked = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
    const result = await attendance.findOneAndUpdate({ _id: existingAttendance._id }, {
        $set: {
            clockOut: now.toISOString(),
            hoursWorked: Math.round(hoursWorked * 100) / 100, // Round to 2 decimal places
            notes,
            updatedAt: now.toISOString(),
        },
    }, { returnDocument: "after" });
    return {
        ...result,
        message: "Clocked out successfully",
        hoursWorked: Math.round(hoursWorked * 100) / 100,
    };
}
// Get my attendance (staff only)
export async function getMyAttendance(request, reply) {
    const attendance = request.server.mongo.db?.collection("attendance");
    if (!attendance) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id: staffId, businessId } = request.user;
    if (!staffId || !businessId) {
        return reply.status(400).send({ error: "Invalid staff token" });
    }
    const query = {
        staffId,
        businessId,
        isActive: true,
    };
    // Filter by date range if provided
    if (request.query.startDate || request.query.endDate) {
        query.clockIn = {};
        if (request.query.startDate) {
            query.clockIn.$gte = request.query.startDate;
        }
        if (request.query.endDate) {
            query.clockIn.$lte = request.query.endDate;
        }
    }
    // Filter by status if provided
    if (request.query.status) {
        query.status = request.query.status;
    }
    const result = await attendance.find(query).sort({ clockIn: -1 }).toArray();
    return result;
}
// ==================== ADMIN ACTIONS ====================
// Get all attendance (admin only - filtered by business access)
export async function getAllAttendance(request, reply) {
    const attendance = request.server.mongo.db?.collection("attendance");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!attendance || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const query = { isActive: true };
    // Filter by business if provided
    if (request.query.businessId) {
        if (!ObjectId.isValid(request.query.businessId)) {
            return reply.status(400).send({ error: "Invalid business ID format" });
        }
        query.businessId = request.query.businessId;
    }
    // Filter by staff if provided
    if (request.query.staffId) {
        query.staffId = request.query.staffId;
    }
    // Filter by status if provided
    if (request.query.status) {
        query.status = request.query.status;
    }
    // Filter by date range
    if (request.query.startDate || request.query.endDate) {
        query.clockIn = {};
        if (request.query.startDate) {
            query.clockIn.$gte = request.query.startDate;
        }
        if (request.query.endDate) {
            query.clockIn.$lte = request.query.endDate;
        }
    }
    // If not super-admin, filter by accessible businesses
    if (request.user.role !== "super-admin") {
        const accessibleBusinesses = await businesses
            .find({ adminIds: request.user.id, isActive: true })
            .project({ _id: 1 })
            .toArray();
        const businessIds = accessibleBusinesses.map((b) => b._id.toString());
        if (query.businessId && !businessIds.includes(query.businessId)) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this business",
            });
        }
        if (!query.businessId) {
            query.businessId = { $in: businessIds };
        }
    }
    const result = await attendance.find(query).sort({ clockIn: -1 }).toArray();
    return result;
}
// Get attendance by business (admin only)
export async function getAttendanceByBusiness(request, reply) {
    const attendance = request.server.mongo.db?.collection("attendance");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!attendance || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { businessId } = request.params;
    if (!ObjectId.isValid(businessId)) {
        return reply.status(400).send({ error: "Invalid business ID format" });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this business",
            });
        }
    }
    const query = { businessId, isActive: true };
    if (request.query.status) {
        query.status = request.query.status;
    }
    if (request.query.startDate || request.query.endDate) {
        query.clockIn = {};
        if (request.query.startDate) {
            query.clockIn.$gte = request.query.startDate;
        }
        if (request.query.endDate) {
            query.clockIn.$lte = request.query.endDate;
        }
    }
    const result = await attendance.find(query).sort({ clockIn: -1 }).toArray();
    return result;
}
// Get attendance by staff (admin only)
export async function getAttendanceByStaff(request, reply) {
    const attendance = request.server.mongo.db?.collection("attendance");
    const staff = request.server.mongo.db?.collection("staff");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!attendance || !staff || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { staffId } = request.params;
    if (!ObjectId.isValid(staffId)) {
        return reply.status(400).send({ error: "Invalid staff ID format" });
    }
    // Get staff to check business access
    const staffMember = await staff.findOne({ _id: new ObjectId(staffId) });
    if (!staffMember) {
        return reply.status(404).send({ error: "Staff member not found" });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(staffMember.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this staff member's business",
            });
        }
    }
    const query = { staffId, isActive: true };
    if (request.query.status) {
        query.status = request.query.status;
    }
    if (request.query.startDate || request.query.endDate) {
        query.clockIn = {};
        if (request.query.startDate) {
            query.clockIn.$gte = request.query.startDate;
        }
        if (request.query.endDate) {
            query.clockIn.$lte = request.query.endDate;
        }
    }
    const result = await attendance.find(query).sort({ clockIn: -1 }).toArray();
    return result;
}
// Approve/reject attendance (admin only)
export async function approveAttendance(request, reply) {
    const attendance = request.server.mongo.db?.collection("attendance");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!attendance || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid attendance ID format" });
    }
    const parseResult = approveAttendanceSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    // Get attendance record
    const existingAttendance = await attendance.findOne({ _id: new ObjectId(id) });
    if (!existingAttendance) {
        return reply.status(404).send({ error: "Attendance record not found" });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(existingAttendance.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this attendance record's business",
            });
        }
    }
    const { status, adminNotes } = parseResult.data;
    const now = new Date().toISOString();
    const result = await attendance.findOneAndUpdate({ _id: new ObjectId(id) }, {
        $set: {
            status,
            adminNotes,
            approvedBy: request.user.id,
            approvedAt: now,
            updatedAt: now,
        },
    }, { returnDocument: "after" });
    return {
        ...result,
        message: `Attendance ${status} successfully`,
    };
}
// Edit attendance (admin only)
export async function editAttendance(request, reply) {
    const attendance = request.server.mongo.db?.collection("attendance");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!attendance || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid attendance ID format" });
    }
    const parseResult = editAttendanceSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    // Get attendance record
    const existingAttendance = await attendance.findOne({ _id: new ObjectId(id) });
    if (!existingAttendance) {
        return reply.status(404).send({ error: "Attendance record not found" });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(existingAttendance.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this attendance record's business",
            });
        }
    }
    // Calculate hours worked if both clockIn and clockOut are present
    const updateData = {
        ...parseResult.data,
        updatedAt: new Date().toISOString(),
    };
    const clockIn = parseResult.data.clockIn || existingAttendance.clockIn;
    const clockOut = parseResult.data.clockOut || existingAttendance.clockOut;
    if (clockIn && clockOut) {
        const clockInTime = new Date(clockIn);
        const clockOutTime = new Date(clockOut);
        updateData.hoursWorked = Math.round((clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60) * 100) / 100;
    }
    const result = await attendance.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateData }, { returnDocument: "after" });
    return result;
}
// Delete attendance (soft delete - admin only)
export async function deleteAttendance(request, reply) {
    const attendance = request.server.mongo.db?.collection("attendance");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!attendance || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid attendance ID format" });
    }
    // Get attendance record
    const existingAttendance = await attendance.findOne({ _id: new ObjectId(id) });
    if (!existingAttendance) {
        return reply.status(404).send({ error: "Attendance record not found" });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(existingAttendance.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this attendance record's business",
            });
        }
    }
    await attendance.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { isActive: false, updatedAt: new Date().toISOString() } });
    return { message: "Attendance record deleted successfully" };
}
//# sourceMappingURL=attendance.controllers.js.map