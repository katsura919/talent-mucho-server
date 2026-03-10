import fp from 'fastify-plugin';
import { v2 as cloudinary } from 'cloudinary';
const cloudinaryPlugin = async (fastify) => {
    // Configure Cloudinary
    cloudinary.config({
        cloud_name: fastify.config.CLOUDINARY_CLOUD_NAME,
        api_key: fastify.config.CLOUDINARY_API_KEY,
        api_secret: fastify.config.CLOUDINARY_API_SECRET,
        secure: true,
    });
    // Helper function to upload files to Cloudinary
    const uploadToCloudinary = async (file, options = {}) => {
        return new Promise((resolve, reject) => {
            const uploadOptions = {
                folder: options.folder || 'avsph',
                public_id: options.public_id,
                resource_type: options.resource_type || 'auto',
            };
            if (typeof file === 'string') {
                // File path or URL
                cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                });
            }
            else {
                // Buffer - use upload_stream
                const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                });
                uploadStream.end(file);
            }
        });
    };
    // Decorate fastify instance
    fastify.decorate('cloudinary', cloudinary);
    fastify.decorate('uploadToCloudinary', uploadToCloudinary);
    fastify.log.info('☁️  Cloudinary configured successfully');
};
export default fp(cloudinaryPlugin, {
    name: 'cloudinary',
    dependencies: ['env'], // Ensure env plugin is loaded first
});
//# sourceMappingURL=cloudinary.js.map