import { ObjectId } from "@fastify/mongodb";
import { createLeadSchema, updateLeadSchema, updateLeadStatusSchema, } from "../../types/lead.types.js";
// Get all leads with optional pagination, filtering, and search
export async function getAllLeads(request, reply) {
    const leads = request.server.mongo.db?.collection("leads");
    if (!leads) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const query = { isActive: true };
    // Filter by status if provided
    if (request.query.status) {
        query.status = request.query.status;
    }
    // Filter by source if provided
    if (request.query.source) {
        query.source = request.query.source;
    }
    // Search by name or email
    if (request.query.search) {
        query.$or = [
            { name: { $regex: request.query.search, $options: "i" } },
            { email: { $regex: request.query.search, $options: "i" } },
        ];
    }
    // Check if pagination is requested
    if (request.query.page || request.query.limit) {
        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const skip = (page - 1) * limit;
        const [result, total] = await Promise.all([
            leads
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            leads.countDocuments(query),
        ]);
        return {
            data: result,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    // Return all results without pagination
    const result = await leads.find(query).sort({ createdAt: -1 }).toArray();
    return result;
}
// Get lead by ID
export async function getLeadById(request, reply) {
    const leads = request.server.mongo.db?.collection("leads");
    if (!leads) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid lead ID format" });
    }
    const lead = await leads.findOne({ _id: new ObjectId(id), isActive: true });
    if (!lead) {
        return reply.status(404).send({ error: "Lead not found" });
    }
    return lead;
}
// Get lead by email
export async function getLeadByEmail(request, reply) {
    const leads = request.server.mongo.db?.collection("leads");
    if (!leads) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { email } = request.params;
    const lead = await leads.findOne({
        email: email.toLowerCase(),
        isActive: true,
    });
    if (!lead) {
        return reply.status(404).send({ error: "Lead not found" });
    }
    return lead;
}
// Create new lead
export async function createLead(request, reply) {
    const leads = request.server.mongo.db?.collection("leads");
    if (!leads) {
        return reply.status(500).send({ error: "Database not available" });
    }
    // Validate request body
    const validationResult = createLeadSchema.safeParse(request.body);
    if (!validationResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: validationResult.error.errors,
        });
    }
    const leadData = validationResult.data;
    // Check if lead with email already exists
    const existingLead = await leads.findOne({
        email: leadData.email.toLowerCase(),
        isActive: true,
    });
    if (existingLead) {
        return reply
            .status(409)
            .send({ error: "Lead with this email already exists" });
    }
    const now = new Date().toISOString();
    const newLead = {
        ...leadData,
        email: leadData.email.toLowerCase(),
        createdAt: now,
        updatedAt: now,
    };
    const result = await leads.insertOne(newLead);
    return {
        ...newLead,
        _id: result.insertedId.toString(),
    };
}
// Update lead
export async function updateLead(request, reply) {
    const leads = request.server.mongo.db?.collection("leads");
    if (!leads) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid lead ID format" });
    }
    // Validate request body
    const validationResult = updateLeadSchema.safeParse(request.body);
    if (!validationResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: validationResult.error.errors,
        });
    }
    const updateData = validationResult.data;
    // If email is being updated, check for duplicates
    if (updateData.email) {
        const existingLead = await leads.findOne({
            email: updateData.email.toLowerCase(),
            _id: { $ne: new ObjectId(id) },
            isActive: true,
        });
        if (existingLead) {
            return reply
                .status(409)
                .send({ error: "Lead with this email already exists" });
        }
        updateData.email = updateData.email.toLowerCase();
    }
    const result = await leads.findOneAndUpdate({ _id: new ObjectId(id), isActive: true }, {
        $set: {
            ...updateData,
            updatedAt: new Date().toISOString(),
        },
    }, { returnDocument: "after" });
    if (!result) {
        return reply.status(404).send({ error: "Lead not found" });
    }
    return result;
}
// Update lead status
export async function updateLeadStatus(request, reply) {
    const leads = request.server.mongo.db?.collection("leads");
    if (!leads) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid lead ID format" });
    }
    // Validate request body
    const validationResult = updateLeadStatusSchema.safeParse(request.body);
    if (!validationResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: validationResult.error.errors,
        });
    }
    const { status } = validationResult.data;
    const result = await leads.findOneAndUpdate({ _id: new ObjectId(id), isActive: true }, {
        $set: {
            status,
            updatedAt: new Date().toISOString(),
        },
    }, { returnDocument: "after" });
    if (!result) {
        return reply.status(404).send({ error: "Lead not found" });
    }
    return result;
}
// Delete lead (soft delete)
export async function deleteLead(request, reply) {
    const leads = request.server.mongo.db?.collection("leads");
    if (!leads) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid lead ID format" });
    }
    const result = await leads.findOneAndUpdate({ _id: new ObjectId(id), isActive: true }, {
        $set: {
            isActive: false,
            updatedAt: new Date().toISOString(),
        },
    }, { returnDocument: "after" });
    if (!result) {
        return reply.status(404).send({ error: "Lead not found" });
    }
    return { message: "Lead deleted successfully" };
}
//# sourceMappingURL=lead.controllers.js.map