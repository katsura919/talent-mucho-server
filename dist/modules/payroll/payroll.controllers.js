import { ObjectId } from "@fastify/mongodb";
import { generatePayrollSchema, generateBusinessPayrollSchema, approvePayrollSchema, addAdjustmentSchema, } from "../../types/payroll.types.js";
// Helper function to calculate pay based on salary type
function calculatePay(salaryType, baseSalary, totalHoursWorked, totalDaysWorked) {
    switch (salaryType) {
        case 'hourly':
            return Math.round(baseSalary * totalHoursWorked * 100) / 100;
        case 'daily':
            return Math.round(baseSalary * totalDaysWorked * 100) / 100;
        case 'monthly':
            // Fixed monthly salary
            return baseSalary;
        case 'annual':
            // Annual salary divided by 12 for monthly pay
            return Math.round((baseSalary / 12) * 100) / 100;
        default:
            return 0;
    }
}
// ==================== PAYROLL GENERATION ====================
// Generate payroll for a single staff member
export async function generatePayroll(request, reply) {
    const payroll = request.server.mongo.db?.collection("payroll");
    const attendance = request.server.mongo.db?.collection("attendance");
    const staff = request.server.mongo.db?.collection("staff");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!payroll || !attendance || !staff || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const parseResult = generatePayrollSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    const { staffId, periodStart, periodEnd } = parseResult.data;
    // Validate staff ID
    if (!ObjectId.isValid(staffId)) {
        return reply.status(400).send({ error: "Invalid staff ID format" });
    }
    // Get staff member
    const staffMember = await staff.findOne({
        _id: new ObjectId(staffId),
        isActive: true,
    });
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
    // Check if payroll already exists for this period
    const existingPayroll = await payroll.findOne({
        staffId,
        periodStart,
        periodEnd,
        isActive: true,
    });
    if (existingPayroll) {
        return reply.status(409).send({
            error: "Payroll already exists",
            message: "A payroll record already exists for this staff member and period",
            payrollId: existingPayroll._id,
        });
    }
    // Get approved attendance records for the period (using workDate)
    const attendanceRecords = await attendance.find({
        staffId,
        businessId: staffMember.businessId,
        status: "approved",
        isActive: true,
        workDate: { $gte: periodStart, $lte: periodEnd },
    }).toArray();
    // Calculate totals
    const totalHoursWorked = attendanceRecords.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
    // Count unique work dates for daily salary
    const uniqueWorkDates = new Set(attendanceRecords.map(record => record.workDate));
    const totalDaysWorked = uniqueWorkDates.size;
    // Get attendance IDs
    const attendanceIds = attendanceRecords.map(record => record._id.toString());
    // Validate staff has salary info
    if (!staffMember.salary || !staffMember.salaryType) {
        return reply.status(400).send({
            error: "Missing salary information",
            message: "Staff member does not have salary configuration. Please update staff salary info first.",
        });
    }
    // Calculate pay
    const calculatedPay = calculatePay(staffMember.salaryType, staffMember.salary, Math.round(totalHoursWorked * 100) / 100, totalDaysWorked);
    const now = new Date().toISOString();
    const newPayroll = {
        staffId,
        businessId: staffMember.businessId,
        periodStart,
        periodEnd,
        totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
        totalDaysWorked,
        salaryType: staffMember.salaryType,
        baseSalary: staffMember.salary,
        calculatedPay,
        deductions: [],
        additions: [],
        netPay: calculatedPay,
        attendanceIds,
        attendanceCount: attendanceRecords.length,
        status: "calculated",
        isActive: true,
        createdAt: now,
        updatedAt: now,
    };
    const result = await payroll.insertOne(newPayroll);
    return reply.status(201).send({
        _id: result.insertedId,
        ...newPayroll,
        message: "Payroll generated successfully",
    });
}
// Generate payroll for all staff in a business
export async function generateBusinessPayroll(request, reply) {
    const payroll = request.server.mongo.db?.collection("payroll");
    const attendance = request.server.mongo.db?.collection("attendance");
    const staffCollection = request.server.mongo.db?.collection("staff");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!payroll || !attendance || !staffCollection || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { businessId } = request.params;
    if (!ObjectId.isValid(businessId)) {
        return reply.status(400).send({ error: "Invalid business ID format" });
    }
    const parseResult = generateBusinessPayrollSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    const { periodStart, periodEnd } = parseResult.data;
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
    // Get all active staff for this business
    const staffMembers = await staffCollection.find({
        businessId,
        isActive: true,
        status: "active",
    }).toArray();
    const results = {
        generated: [],
        skipped: [],
        errors: [],
    };
    for (const staffMember of staffMembers) {
        const staffId = staffMember._id.toString();
        // Check if payroll already exists
        const existingPayroll = await payroll.findOne({
            staffId,
            periodStart,
            periodEnd,
            isActive: true,
        });
        if (existingPayroll) {
            results.skipped.push({
                staffId,
                staffName: `${staffMember.firstName} ${staffMember.lastName}`,
                reason: "Payroll already exists for this period",
            });
            continue;
        }
        // Check if staff has salary info
        if (!staffMember.salary || !staffMember.salaryType) {
            results.errors.push({
                staffId,
                staffName: `${staffMember.firstName} ${staffMember.lastName}`,
                reason: "Missing salary configuration",
            });
            continue;
        }
        // Get approved attendance
        const attendanceRecords = await attendance.find({
            staffId,
            businessId,
            status: "approved",
            isActive: true,
            workDate: { $gte: periodStart, $lte: periodEnd },
        }).toArray();
        const totalHoursWorked = attendanceRecords.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
        const uniqueWorkDates = new Set(attendanceRecords.map(record => record.workDate));
        const totalDaysWorked = uniqueWorkDates.size;
        const attendanceIds = attendanceRecords.map(record => record._id.toString());
        const calculatedPay = calculatePay(staffMember.salaryType, staffMember.salary, Math.round(totalHoursWorked * 100) / 100, totalDaysWorked);
        const now = new Date().toISOString();
        const newPayroll = {
            staffId,
            businessId,
            periodStart,
            periodEnd,
            totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
            totalDaysWorked,
            salaryType: staffMember.salaryType,
            baseSalary: staffMember.salary,
            calculatedPay,
            deductions: [],
            additions: [],
            netPay: calculatedPay,
            attendanceIds,
            attendanceCount: attendanceRecords.length,
            status: "calculated",
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };
        const result = await payroll.insertOne(newPayroll);
        results.generated.push({
            _id: result.insertedId,
            staffId,
            staffName: `${staffMember.firstName} ${staffMember.lastName}`,
            calculatedPay,
            netPay: calculatedPay,
        });
    }
    return {
        message: "Batch payroll generation completed",
        summary: {
            total: staffMembers.length,
            generated: results.generated.length,
            skipped: results.skipped.length,
            errors: results.errors.length,
        },
        ...results,
    };
}
// ==================== PAYROLL RETRIEVAL ====================
// Get payroll by ID
export async function getPayrollById(request, reply) {
    const payroll = request.server.mongo.db?.collection("payroll");
    const businesses = request.server.mongo.db?.collection("businesses");
    const staff = request.server.mongo.db?.collection("staff");
    if (!payroll || !businesses || !staff) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid payroll ID format" });
    }
    const payrollRecord = await payroll.findOne({
        _id: new ObjectId(id),
        isActive: true,
    });
    if (!payrollRecord) {
        return reply.status(404).send({ error: "Payroll record not found" });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(payrollRecord.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this payroll record",
            });
        }
    }
    // Optionally include staff details
    const staffMember = await staff.findOne({ _id: new ObjectId(payrollRecord.staffId) });
    return {
        ...payrollRecord,
        staff: staffMember ? {
            firstName: staffMember.firstName,
            lastName: staffMember.lastName,
            position: staffMember.position,
        } : null,
    };
}
// Get payroll by staff
export async function getPayrollByStaff(request, reply) {
    const payroll = request.server.mongo.db?.collection("payroll");
    const staff = request.server.mongo.db?.collection("staff");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!payroll || !staff || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { staffId } = request.params;
    if (!ObjectId.isValid(staffId)) {
        return reply.status(400).send({ error: "Invalid staff ID format" });
    }
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
                message: "You do not have access to this staff member",
            });
        }
    }
    const query = { staffId, isActive: true };
    if (request.query.status) {
        query.status = request.query.status;
    }
    if (request.query.startDate || request.query.endDate) {
        query.periodStart = {};
        if (request.query.startDate) {
            query.periodStart.$gte = request.query.startDate;
        }
        if (request.query.endDate) {
            query.periodStart.$lte = request.query.endDate;
        }
    }
    const result = await payroll.find(query).sort({ periodStart: -1 }).toArray();
    return result;
}
// Get payroll by business
export async function getPayrollByBusiness(request, reply) {
    const payroll = request.server.mongo.db?.collection("payroll");
    const businesses = request.server.mongo.db?.collection("businesses");
    const staff = request.server.mongo.db?.collection("staff");
    if (!payroll || !businesses || !staff) {
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
        query.periodStart = {};
        if (request.query.startDate) {
            query.periodStart.$gte = request.query.startDate;
        }
        if (request.query.endDate) {
            query.periodStart.$lte = request.query.endDate;
        }
    }
    // Get payroll with staff details
    const payrollRecords = await payroll.find(query).sort({ periodStart: -1 }).toArray();
    // Fetch staff details for each record
    const staffIds = [...new Set(payrollRecords.map(p => p.staffId))];
    const staffMembers = await staff.find({
        _id: { $in: staffIds.map(id => new ObjectId(id)) }
    }).toArray();
    const staffMap = new Map(staffMembers.map(s => [s._id.toString(), s]));
    return payrollRecords.map(p => ({
        ...p,
        staff: staffMap.has(p.staffId) ? {
            firstName: staffMap.get(p.staffId).firstName,
            lastName: staffMap.get(p.staffId).lastName,
            position: staffMap.get(p.staffId).position,
        } : null,
    }));
}
// ==================== PAYROLL ACTIONS ====================
// Approve payroll
export async function approvePayroll(request, reply) {
    const payroll = request.server.mongo.db?.collection("payroll");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!payroll || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid payroll ID format" });
    }
    const parseResult = approvePayrollSchema.safeParse(request.body);
    const notes = parseResult.success ? parseResult.data.notes : undefined;
    const payrollRecord = await payroll.findOne({
        _id: new ObjectId(id),
        isActive: true,
    });
    if (!payrollRecord) {
        return reply.status(404).send({ error: "Payroll record not found" });
    }
    if (payrollRecord.status === "paid") {
        return reply.status(400).send({
            error: "Cannot modify paid payroll",
            message: "This payroll has already been paid",
        });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(payrollRecord.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this payroll record",
            });
        }
    }
    const now = new Date().toISOString();
    const result = await payroll.findOneAndUpdate({ _id: new ObjectId(id) }, {
        $set: {
            status: "approved",
            approvedBy: request.user.id,
            approvedAt: now,
            notes: notes || payrollRecord.notes,
            updatedAt: now,
        },
    }, { returnDocument: "after" });
    return {
        ...result,
        message: "Payroll approved successfully",
    };
}
// Mark payroll as paid
export async function markPayrollPaid(request, reply) {
    const payroll = request.server.mongo.db?.collection("payroll");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!payroll || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid payroll ID format" });
    }
    const payrollRecord = await payroll.findOne({
        _id: new ObjectId(id),
        isActive: true,
    });
    if (!payrollRecord) {
        return reply.status(404).send({ error: "Payroll record not found" });
    }
    if (payrollRecord.status === "paid") {
        return reply.status(400).send({
            error: "Already paid",
            message: "This payroll has already been marked as paid",
        });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(payrollRecord.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this payroll record",
            });
        }
    }
    const now = new Date().toISOString();
    const result = await payroll.findOneAndUpdate({ _id: new ObjectId(id) }, {
        $set: {
            status: "paid",
            paidAt: now,
            updatedAt: now,
        },
    }, { returnDocument: "after" });
    return {
        ...result,
        message: "Payroll marked as paid",
    };
}
// Add adjustment (deduction or addition)
export async function addPayrollAdjustment(request, reply) {
    const payroll = request.server.mongo.db?.collection("payroll");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!payroll || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid payroll ID format" });
    }
    const parseResult = addAdjustmentSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    const { type, adjustmentType, description, amount } = parseResult.data;
    const payrollRecord = await payroll.findOne({
        _id: new ObjectId(id),
        isActive: true,
    });
    if (!payrollRecord) {
        return reply.status(404).send({ error: "Payroll record not found" });
    }
    if (payrollRecord.status === "paid") {
        return reply.status(400).send({
            error: "Cannot modify paid payroll",
            message: "This payroll has already been paid",
        });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(payrollRecord.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this payroll record",
            });
        }
    }
    const adjustment = {
        type: adjustmentType,
        description,
        amount,
    };
    const updateField = type === 'deduction' ? 'deductions' : 'additions';
    // Calculate new net pay
    const deductionsTotal = type === 'deduction'
        ? [...payrollRecord.deductions, adjustment].reduce((sum, d) => sum + d.amount, 0)
        : payrollRecord.deductions.reduce((sum, d) => sum + d.amount, 0);
    const additionsTotal = type === 'addition'
        ? [...payrollRecord.additions, adjustment].reduce((sum, a) => sum + a.amount, 0)
        : payrollRecord.additions.reduce((sum, a) => sum + a.amount, 0);
    const newNetPay = payrollRecord.calculatedPay + additionsTotal - deductionsTotal;
    const now = new Date().toISOString();
    const result = await payroll.findOneAndUpdate({ _id: new ObjectId(id) }, {
        $push: { [updateField]: adjustment },
        $set: {
            netPay: Math.round(newNetPay * 100) / 100,
            updatedAt: now,
        },
    }, { returnDocument: "after" });
    return {
        ...result,
        message: `${type === 'deduction' ? 'Deduction' : 'Addition'} added successfully`,
    };
}
// Delete payroll (soft delete)
export async function deletePayroll(request, reply) {
    const payroll = request.server.mongo.db?.collection("payroll");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!payroll || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid payroll ID format" });
    }
    const payrollRecord = await payroll.findOne({
        _id: new ObjectId(id),
        isActive: true,
    });
    if (!payrollRecord) {
        return reply.status(404).send({ error: "Payroll record not found" });
    }
    if (payrollRecord.status === "paid") {
        return reply.status(400).send({
            error: "Cannot delete paid payroll",
            message: "Paid payroll records cannot be deleted",
        });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(payrollRecord.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this payroll record",
            });
        }
    }
    await payroll.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { isActive: false, updatedAt: new Date().toISOString() } });
    return { message: "Payroll record deleted successfully" };
}
//# sourceMappingURL=payroll.controllers.js.map