import type { FastifyPluginAsync } from 'fastify';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
declare module 'fastify' {
    interface FastifyInstance {
        cloudinary: typeof cloudinary;
        uploadToCloudinary: (file: string | Buffer, options?: {
            folder?: string;
            public_id?: string;
            resource_type?: 'image' | 'video' | 'raw' | 'auto';
        }) => Promise<UploadApiResponse>;
    }
}
declare const _default: FastifyPluginAsync;
export default _default;
//# sourceMappingURL=cloudinary.d.ts.map