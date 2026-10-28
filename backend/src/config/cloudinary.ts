import { v2 as cloudinary } from 'cloudinary';
import { ENV } from './env.js';

// Configure Cloudinary
cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper function to determine resource type from MIME type
const getResourceType = (mimetype: string): 'image' | 'video' | 'raw' => {
    if (mimetype.startsWith('image/')) {
        return 'image';
    } else if (mimetype.startsWith('video/')) {
        return 'video';
    } else {
        return 'raw'; // For documents and other files
    }
};

// Helper function to upload file to Cloudinary (supports images, videos, and files)
export const uploadToCloudinary = async (
    file: { buffer: Buffer; mimetype: string; originalname?: string },
    folder: string = 'habibi-properties'
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const resourceType = getResourceType(file.mimetype);
        
        const uploadOptions: any = {
            folder: folder,
            resource_type: resourceType,
        };

        // Apply transformations only for images
        if (resourceType === 'image') {
            uploadOptions.transformation = [
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ];
        }

        // For videos, add some optimization options
        if (resourceType === 'video') {
            uploadOptions.eager = [
                { quality: 'auto', fetch_format: 'auto' }
            ];
        }

        // For raw files (documents), use raw resource type
        if (resourceType === 'raw') {
            // Keep original filename for documents
            if (file.originalname) {
                uploadOptions.public_id = file.originalname.split('.')[0];
            }
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve(result.secure_url);
                } else {
                    reject(new Error('Upload failed: No result returned'));
                }
            }
        );

        uploadStream.end(file.buffer);
    });
};

// Helper function to upload multiple images
export const uploadMultipleToCloudinary = async (
    files: Array<{ buffer: Buffer; mimetype: string }>,
    folder: string = 'habibi-properties'
): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
    return Promise.all(uploadPromises);
};

// Helper function to delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

// Helper function to extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string | null => {
    try {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        const publicId = filename.split('.')[0];
        const folder = parts.slice(-2, -1)[0];
        return folder ? `${folder}/${publicId}` : publicId;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};

