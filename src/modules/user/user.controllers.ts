import type { FastifyRequest, FastifyReply } from 'fastify';
import { ObjectId } from '@fastify/mongodb';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { createUserSchema, updateUserSchema } from '../../types/user.types.js';

// Types for request parameters
interface IdParams {
    id: string;
}

// Get all users
export async function getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    const users = request.server.mongo.db?.collection('users');

    if (!users) {
        return reply.status(500).send({ error: 'Database not available' });
    }

    const result = await users.find({ isActive: true }).toArray();

    // Remove password from results
    return result.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });
}

// Get user by ID
export async function getUserById(
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply
) {
    const users = request.server.mongo.db?.collection('users');

    if (!users) {
        return reply.status(500).send({ error: 'Database not available' });
    }

    const { id } = request.params;

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: 'Invalid user ID format' });
    }

    const user = await users.findOne({ _id: new ObjectId(id) });

    if (!user) {
        return reply.status(404).send({ error: 'User not found' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

// Create a new user
export async function createUser(
    request: FastifyRequest<{ Body: z.infer<typeof createUserSchema> }>,
    reply: FastifyReply
) {
    const users = request.server.mongo.db?.collection('users');

    if (!users) {
        return reply.status(500).send({ error: 'Database not available' });
    }

    // Validate request body with Zod
    const parseResult = createUserSchema.safeParse(request.body);

    if (!parseResult.success) {
        return reply.status(400).send({
            error: 'Validation failed',
            details: parseResult.error.errors,
        });
    }

    const { firstName, lastName, email, password, position, dateHired, isActive = true } = parseResult.data;

    // Check if email already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
        return reply.status(409).send({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const now = new Date().toISOString();
    const newUser = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        position,
        dateHired,
        isActive,
        createdAt: now,
        updatedAt: now,
    };

    const result = await users.insertOne(newUser);

    // Remove password from response
    const { password: _, ...responseUser } = newUser;

    return reply.status(201).send({
        _id: result.insertedId,
        ...responseUser,
    });
}

// Update a user
export async function updateUser(
    request: FastifyRequest<{ Params: IdParams; Body: z.infer<typeof updateUserSchema> }>,
    reply: FastifyReply
) {
    const users = request.server.mongo.db?.collection('users');

    if (!users) {
        return reply.status(500).send({ error: 'Database not available' });
    }

    const { id } = request.params;

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: 'Invalid user ID format' });
    }

    // Validate request body with Zod
    const parseResult = updateUserSchema.safeParse(request.body);

    if (!parseResult.success) {
        return reply.status(400).send({
            error: 'Validation failed',
            details: parseResult.error.errors,
        });
    }

    // Check if email is being updated and if it already exists
    if (parseResult.data.email) {
        const existingUser = await users.findOne({
            email: parseResult.data.email,
            _id: { $ne: new ObjectId(id) },
        });
        if (existingUser) {
            return reply.status(409).send({ error: 'Email already exists' });
        }
    }

    const updateData: any = {
        ...parseResult.data,
        updatedAt: new Date().toISOString(),
    };

    // Hash password if it's being updated
    if (parseResult.data.password) {
        updateData.password = await bcrypt.hash(parseResult.data.password, 10);
    }

    const result = await users.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
    );

    if (!result) {
        return reply.status(404).send({ error: 'User not found' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = result as any;
    return userWithoutPassword;
}

// Delete a user (soft delete - sets isActive to false)
export async function deleteUser(
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply
) {
    const users = request.server.mongo.db?.collection('users');

    if (!users) {
        return reply.status(500).send({ error: 'Database not available' });
    }

    const { id } = request.params;

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: 'Invalid user ID format' });
    }

    const result = await users.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { isActive: false, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after' }
    );

    if (!result) {
        return reply.status(404).send({ error: 'User not found' });
    }

    return reply.status(200).send({ message: 'User deleted successfully' });
}

// Hard delete a user (permanent)
export async function hardDeleteUser(
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply
) {
    const users = request.server.mongo.db?.collection('users');

    if (!users) {
        return reply.status(500).send({ error: 'Database not available' });
    }

    const { id } = request.params;

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: 'Invalid user ID format' });
    }

    const result = await users.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
        return reply.status(404).send({ error: 'User not found' });
    }

    return reply.status(200).send({ message: 'User permanently deleted' });
}
