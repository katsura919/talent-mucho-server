import { ObjectId } from "@fastify/mongodb";
import { createCommentWithLeadSchema, updateCommentSchema, approveCommentSchema, } from "../../types/comment.types.js";
// Get comments for a blog by slug (public - only approved)
export async function getCommentsBySlug(request, reply) {
    const blogs = request.server.mongo.db?.collection("blogs");
    const comments = request.server.mongo.db?.collection("comments");
    const leads = request.server.mongo.db?.collection("leads");
    if (!blogs || !comments || !leads) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { slug } = request.params;
    const page = request.query.page || 1;
    const limit = request.query.limit || 20;
    const skip = (page - 1) * limit;
    // Find blog by slug
    const blog = await blogs.findOne({
        slug,
        isActive: true,
        status: "published",
    });
    if (!blog) {
        return reply.status(404).send({ error: "Blog not found" });
    }
    const blogId = blog._id.toString();
    // Get approved comments with pagination
    const [commentsList, total] = await Promise.all([
        comments
            .find({ blogId, isApproved: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray(),
        comments.countDocuments({ blogId, isApproved: true }),
    ]);
    // Populate lead information
    const commentsWithLeads = await Promise.all(commentsList.map(async (comment) => {
        const lead = await leads.findOne({ _id: new ObjectId(comment.leadId) });
        return {
            _id: comment._id.toString(),
            comment: comment.comment,
            createdAt: comment.createdAt,
            lead: lead
                ? {
                    _id: lead._id.toString(),
                    name: lead.name,
                }
                : null,
        };
    }));
    return {
        data: commentsWithLeads,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
// Get all comments (admin - all comments with filters)
export async function getAllComments(request, reply) {
    const comments = request.server.mongo.db?.collection("comments");
    const leads = request.server.mongo.db?.collection("leads");
    if (!comments || !leads) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const page = request.query.page || 1;
    const limit = request.query.limit || 20;
    const skip = (page - 1) * limit;
    // Build aggregation pipeline
    const pipeline = [];
    // Match stage for basic filters
    const matchStage = {};
    if (request.query.blogId) {
        if (!ObjectId.isValid(request.query.blogId)) {
            return reply.status(400).send({ error: "Invalid blog ID format" });
        }
        matchStage.blogId = request.query.blogId;
    }
    if (request.query.isApproved !== undefined) {
        matchStage.isApproved = request.query.isApproved;
    }
    if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
    }
    // Lookup lead information
    pipeline.push({
        $lookup: {
            from: "leads",
            localField: "leadId",
            foreignField: "_id",
            as: "leadData",
        },
    });
    pipeline.push({
        $unwind: {
            path: "$leadData",
            preserveNullAndEmptyArrays: true,
        },
    });
    // Search stage
    if (request.query.search) {
        pipeline.push({
            $match: {
                $or: [
                    { comment: { $regex: request.query.search, $options: "i" } },
                    { "leadData.name": { $regex: request.query.search, $options: "i" } },
                    { "leadData.email": { $regex: request.query.search, $options: "i" } },
                ],
            },
        });
    }
    // Sort by createdAt descending
    pipeline.push({ $sort: { createdAt: -1 } });
    // Get total count
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await comments.aggregate(countPipeline).toArray();
    const total = countResult[0]?.total || 0;
    // Add pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });
    // Execute aggregation
    const commentsList = await comments.aggregate(pipeline).toArray();
    // Format response
    const commentsWithLeads = commentsList.map((comment) => ({
        _id: comment._id.toString(),
        blogId: comment.blogId,
        comment: comment.comment,
        isApproved: comment.isApproved,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        lead: comment.leadData
            ? {
                _id: comment.leadData._id.toString(),
                name: comment.leadData.name,
                email: comment.leadData.email,
                phone: comment.leadData.phone,
            }
            : null,
    }));
    return {
        data: commentsWithLeads,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
// Create comment (public)
export async function createComment(request, reply) {
    const blogs = request.server.mongo.db?.collection("blogs");
    const comments = request.server.mongo.db?.collection("comments");
    const leads = request.server.mongo.db?.collection("leads");
    if (!blogs || !comments || !leads) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { slug } = request.params;
    // Validate request body
    const validationResult = createCommentWithLeadSchema.safeParse(request.body);
    if (!validationResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: validationResult.error.errors,
        });
    }
    const { name, email, phone, comment } = validationResult.data;
    // Find blog by slug
    const blog = await blogs.findOne({
        slug,
        isActive: true,
        status: "published",
    });
    if (!blog) {
        return reply.status(404).send({ error: "Blog not found" });
    }
    const blogId = blog._id.toString();
    const now = new Date().toISOString();
    // Check if lead exists by email
    let lead = await leads.findOne({
        email: email.toLowerCase(),
        isActive: true,
    });
    let leadId;
    if (lead) {
        // Update existing lead's updatedAt timestamp
        leadId = lead._id.toString();
        await leads.updateOne({ _id: lead._id }, { $set: { updatedAt: now } });
    }
    else {
        // Create new lead
        const newLead = {
            name,
            email: email.toLowerCase(),
            phone,
            source: "blog_comment",
            status: "new",
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };
        const leadResult = await leads.insertOne(newLead);
        leadId = leadResult.insertedId.toString();
    }
    // Create comment
    const newComment = {
        blogId,
        leadId,
        comment,
        isApproved: true,
        createdAt: now,
        updatedAt: now,
    };
    const commentResult = await comments.insertOne(newComment);
    // Increment blog comment count
    await blogs.updateOne({ _id: blog._id }, { $inc: { commentCount: 1 } });
    return {
        _id: commentResult.insertedId.toString(),
        ...newComment,
    };
}
// Update comment approval status (admin)
export async function approveComment(request, reply) {
    const comments = request.server.mongo.db?.collection("comments");
    if (!comments) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid comment ID format" });
    }
    // Validate request body
    const validationResult = approveCommentSchema.safeParse(request.body);
    if (!validationResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: validationResult.error.errors,
        });
    }
    const { isApproved } = validationResult.data;
    const result = await comments.findOneAndUpdate({ _id: new ObjectId(id) }, {
        $set: {
            isApproved,
            updatedAt: new Date().toISOString(),
        },
    }, { returnDocument: "after" });
    if (!result) {
        return reply.status(404).send({ error: "Comment not found" });
    }
    return result;
}
// Update comment (admin)
export async function updateComment(request, reply) {
    const comments = request.server.mongo.db?.collection("comments");
    if (!comments) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid comment ID format" });
    }
    // Validate request body
    const validationResult = updateCommentSchema.safeParse(request.body);
    if (!validationResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: validationResult.error.errors,
        });
    }
    const updateData = validationResult.data;
    const result = await comments.findOneAndUpdate({ _id: new ObjectId(id) }, {
        $set: {
            ...updateData,
            updatedAt: new Date().toISOString(),
        },
    }, { returnDocument: "after" });
    if (!result) {
        return reply.status(404).send({ error: "Comment not found" });
    }
    return result;
}
// Delete comment (admin)
export async function deleteComment(request, reply) {
    const comments = request.server.mongo.db?.collection("comments");
    const blogs = request.server.mongo.db?.collection("blogs");
    if (!comments || !blogs) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid comment ID format" });
    }
    // Get comment to find associated blog
    const comment = await comments.findOne({ _id: new ObjectId(id) });
    if (!comment) {
        return reply.status(404).send({ error: "Comment not found" });
    }
    // Delete comment
    await comments.deleteOne({ _id: new ObjectId(id) });
    // Decrement blog comment count
    await blogs.updateOne({ _id: new ObjectId(comment.blogId) }, { $inc: { commentCount: -1 } });
    return { message: "Comment deleted successfully" };
}
//# sourceMappingURL=comment.controllers.js.map