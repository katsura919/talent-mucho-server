import type { FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";
import { createBlogSchema, updateBlogSchema } from "../../types/blog.types.js";

interface IdParams {
  id: string;
}

interface SlugParams {
  slug: string;
}

interface BusinessIdParams {
  businessId: string;
}

interface BlogQuery {
  businessId?: string;
  status?: "draft" | "published";
  category?: string;
}

// Get all blogs
export async function getAllBlogs(
  request: FastifyRequest<{ Querystring: BlogQuery }>,
  reply: FastifyReply,
) {
  const blogs = request.server.mongo.db?.collection("blogs");

  if (!blogs) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const query: any = { isActive: true };

  // Filter by business if provided
  if (request.query.businessId) {
    if (!ObjectId.isValid(request.query.businessId)) {
      return reply.status(400).send({ error: "Invalid business ID format" });
    }
    query.businessId = request.query.businessId;
  }

  // Filter by status if provided
  if (request.query.status) {
    query.status = request.query.status;
  }

  // Filter by category if provided
  if (request.query.category) {
    query.category = request.query.category;
  }

  const result = await blogs.find(query).sort({ createdAt: -1 }).toArray();
  return result;
}

// Get blog by ID
export async function getBlogById(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const blogs = request.server.mongo.db?.collection("blogs");

  if (!blogs) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid blog ID format" });
  }

  const blog = await blogs.findOne({ _id: new ObjectId(id) });

  if (!blog) {
    return reply.status(404).send({ error: "Blog not found" });
  }

  return blog;
}

// Get blog by slug
export async function getBlogBySlug(
  request: FastifyRequest<{ Params: SlugParams }>,
  reply: FastifyReply,
) {
  const blogs = request.server.mongo.db?.collection("blogs");

  if (!blogs) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { slug } = request.params;

  // Find and increment view count in one operation
  const blog = await blogs.findOneAndUpdate(
    {
      slug,
      isActive: true,
      status: "published",
    },
    {
      $inc: { viewCount: 1 },
    },
    { returnDocument: "after" },
  );

  if (!blog) {
    return reply.status(404).send({ error: "Blog not found" });
  }

  return blog;
}

interface PublicBlogsQuery {
  businessId?: string;
  category?: string;
  page?: string;
  limit?: string;
}

// Get public blogs for landing page (minimal fields)
export async function getPublicBlogs(
  request: FastifyRequest<{ Querystring: PublicBlogsQuery }>,
  reply: FastifyReply,
) {
  const blogs = request.server.mongo.db?.collection("blogs");

  if (!blogs) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { businessId, category, page = "1", limit = "10" } = request.query;

  // Build query - only published and active blogs
  const query: any = { isActive: true, status: "published" };

  // Filter by business if provided
  if (businessId) {
    query.businessId = businessId;
  }

  // Filter by category if provided
  if (category) {
    query.category = category;
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  // Get total count for pagination
  const totalItems = await blogs.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limitNum);

  // Project only required fields
  const result = await blogs
    .find(query)
    .project({
      _id: 1,
      title: 1,
      featuredImage: 1,
      category: 1,
      slug: 1,
      createdAt: 1,
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .toArray();

  return {
    data: result,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalItems,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
}

interface BlogByBusinessQuery {
  search?: string;
  page?: string;
  limit?: string;
  status?: "draft" | "published" | "all";
}

// Get blogs by business ID
export async function getBlogsByBusiness(
  request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: BlogByBusinessQuery;
  }>,
  reply: FastifyReply,
) {
  const blogs = request.server.mongo.db?.collection("blogs");

  if (!blogs) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { businessId } = request.params;
  const { search, page = "1", limit = "10", status = "all" } = request.query;

  if (!ObjectId.isValid(businessId)) {
    return reply.status(400).send({ error: "Invalid business ID format" });
  }

  // Build query
  const query: any = { businessId, isActive: true };

  // Add status filter (if not "all")
  if (status && status !== "all") {
    query.status = status;
  }

  // Add search filter
  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { title: searchRegex },
      { excerpt: searchRegex },
      { slug: searchRegex },
    ];
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  // Get total count for pagination
  const totalItems = await blogs.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limitNum);

  const result = await blogs
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .toArray();

  return {
    data: result,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalItems,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
}

// Create blog
export async function createBlog(request: FastifyRequest, reply: FastifyReply) {
  const blogs = request.server.mongo.db?.collection("blogs");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!blogs || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const parseResult = createBlogSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const {
    title,
    slug,
    content,
    excerpt,
    featuredImage,
    category,
    businessId,
    status = "draft",
    isActive = true,
  } = parseResult.data;

  // Validate business exists
  if (!ObjectId.isValid(businessId)) {
    return reply.status(400).send({ error: "Invalid business ID format" });
  }

  const business = await businesses.findOne({
    _id: new ObjectId(businessId),
    isActive: true,
  });
  if (!business) {
    return reply.status(404).send({ error: "Business not found" });
  }

  // Check if slug already exists
  const existingBlog = await blogs.findOne({ slug });
  if (existingBlog) {
    return reply.status(409).send({ error: "Slug already exists" });
  }

  const now = new Date().toISOString();
  const newBlog = {
    title,
    slug,
    content,
    excerpt,
    featuredImage,
    contentImages: [],
    category,
    businessId,
    authorId: request.user.id,
    status,
    publishedAt: status === "published" ? now : undefined,
    isActive,
    createdAt: now,
    updatedAt: now,
  };

  const result = await blogs.insertOne(newBlog);

  return reply.status(201).send({
    _id: result.insertedId,
    ...newBlog,
  });
}

// Update blog
export async function updateBlog(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const blogs = request.server.mongo.db?.collection("blogs");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!blogs || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid blog ID format" });
  }

  // Get the blog to check business access
  const existingBlog = await blogs.findOne({ _id: new ObjectId(id) });
  if (!existingBlog) {
    return reply.status(404).send({ error: "Blog not found" });
  }

  // Check if admin has access to the blog's business (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(existingBlog.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this blog's business",
      });
    }
  }

  const parseResult = updateBlogSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  // Check if slug is being updated and already exists
  if (parseResult.data.slug) {
    const existingBlog = await blogs.findOne({
      slug: parseResult.data.slug,
      _id: { $ne: new ObjectId(id) },
    });
    if (existingBlog) {
      return reply.status(409).send({ error: "Slug already exists" });
    }
  }

  const now = new Date().toISOString();
  const updateData: any = {
    ...parseResult.data,
    updatedAt: now,
  };

  // Set publishedAt if publishing for the first time
  if (parseResult.data.status === "published") {
    const currentBlog = await blogs.findOne({ _id: new ObjectId(id) });
    if (currentBlog && !currentBlog.publishedAt) {
      updateData.publishedAt = now;
    }
  }

  const result = await blogs.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: "after" },
  );

  if (!result) {
    return reply.status(404).send({ error: "Blog not found" });
  }

  return result;
}

// Delete blog (soft delete)
export async function deleteBlog(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const blogs = request.server.mongo.db?.collection("blogs");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!blogs || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid blog ID format" });
  }

  // Get the blog to check business access
  const existingBlog = await blogs.findOne({ _id: new ObjectId(id) });
  if (!existingBlog) {
    return reply.status(404).send({ error: "Blog not found" });
  }

  // Check if admin has access to the blog's business (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(existingBlog.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this blog's business",
      });
    }
  }

  const result = await blogs.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { isActive: false, updatedAt: new Date().toISOString() } },
    { returnDocument: "after" },
  );

  if (!result) {
    return reply.status(404).send({ error: "Blog not found" });
  }

  return reply.status(200).send({ message: "Blog deleted successfully" });
}

// Upload blog featured image
export async function uploadBlogFeaturedImage(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const blogs = request.server.mongo.db?.collection("blogs");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!blogs || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid blog ID format" });
  }

  // Check if blog exists
  const blog = await blogs.findOne({ _id: new ObjectId(id) });
  if (!blog) {
    return reply.status(404).send({ error: "Blog not found" });
  }

  // Check if admin has access to the blog's business (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(blog.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this blog's business",
      });
    }
  }

  try {
    // Get the uploaded file
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: "No file uploaded" });
    }

    // Validate file type
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedMimeTypes.includes(data.mimetype)) {
      return reply.status(400).send({
        error: "Invalid file type. Allowed types: JPEG, PNG, WebP, GIF",
      });
    }

    // Convert file stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of data.file) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // Upload to Cloudinary
    const uploadResult = await request.server.uploadToCloudinary(fileBuffer, {
      folder: `blogs/${blog.businessId}/${id}`,
      public_id: `featured_${Date.now()}`,
      resource_type: "image",
    });

    // Update blog with new featured image URL
    const result = await blogs.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          featuredImage: uploadResult.secure_url,
          updatedAt: new Date().toISOString(),
        },
      },
      { returnDocument: "after" },
    );

    return reply.status(200).send({
      message: "Featured image uploaded successfully",
      featuredImage: uploadResult.secure_url,
      blog: result,
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({
      error: "Failed to upload featured image",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Increment blog view count
export async function incrementBlogView(
  request: FastifyRequest<{ Params: SlugParams }>,
  reply: FastifyReply,
) {
  const blogs = request.server.mongo.db?.collection("blogs");

  if (!blogs) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { slug } = request.params;

  // Find and increment view count
  const result = await blogs.findOneAndUpdate(
    {
      slug,
      isActive: true,
      status: "published",
    },
    {
      $inc: { viewCount: 1 },
    },
    { returnDocument: "after" },
  );

  if (!result) {
    return reply.status(404).send({ error: "Blog not found" });
  }

  return {
    message: "View count incremented",
    viewCount: result.viewCount,
  };
}

// Upload blog content image
export async function uploadBlogContentImage(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const blogs = request.server.mongo.db?.collection("blogs");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!blogs || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid blog ID format" });
  }

  // Check if blog exists
  const blog = await blogs.findOne({ _id: new ObjectId(id) });
  if (!blog) {
    return reply.status(404).send({ error: "Blog not found" });
  }

  // Check if admin has access to the blog's business (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(blog.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this blog's business",
      });
    }
  }

  // Check content images limit
  const currentImageCount = blog.contentImages?.length || 0;
  if (currentImageCount >= 5) {
    return reply.status(400).send({
      error: "Content image limit reached",
      message: "Maximum 5 content images allowed per blog",
    });
  }

  try {
    // Get the uploaded file
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: "No file uploaded" });
    }

    // Validate file type
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedMimeTypes.includes(data.mimetype)) {
      return reply.status(400).send({
        error: "Invalid file type. Allowed types: JPEG, PNG, WebP, GIF",
      });
    }

    // Validate file size (max 5MB)
    const chunks: Buffer[] = [];
    for await (const chunk of data.file) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    if (fileBuffer.length > 5 * 1024 * 1024) {
      return reply.status(400).send({
        error: "File too large. Maximum size is 5MB",
      });
    }

    // Upload to Cloudinary
    const uploadResult = await request.server.uploadToCloudinary(fileBuffer, {
      folder: `blogs/${blog.businessId}/${id}/content`,
      public_id: `content_${Date.now()}`,
      resource_type: "image",
    });

    // Add image URL to contentImages array
    const result = await blogs.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $push: { contentImages: uploadResult.secure_url } as any,
        $set: { updatedAt: new Date().toISOString() },
      },
      { returnDocument: "after" },
    );

    return reply.status(200).send({
      message: "Content image uploaded successfully",
      url: uploadResult.secure_url,
      blog: result,
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({
      error: "Failed to upload content image",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
