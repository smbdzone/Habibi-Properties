import { uploadToCloudinary, uploadMultipleToCloudinary } from '../config/cloudinary.js';
// Upload single image
export const uploadSingleImage = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
            return;
        }
        const folder = req.body.folder || 'habibi-properties';
        const imageUrl = await uploadToCloudinary(req.file, folder);
        res.status(200).json({
            success: true,
            data: {
                url: imageUrl,
                publicId: extractPublicIdFromUrl(imageUrl)
            },
            message: 'Image uploaded successfully'
        });
    }
    catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: error.message
        });
    }
};
// Upload multiple images
export const uploadMultipleImages = async (req, res) => {
    try {
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            res.status(400).json({
                success: false,
                message: 'No image files provided'
            });
            return;
        }
        const files = Array.isArray(req.files) ? req.files : [];
        const folder = req.body.folder || 'habibi-properties';
        const imageUrls = await uploadMultipleToCloudinary(files, folder);
        res.status(200).json({
            success: true,
            data: {
                urls: imageUrls,
                count: imageUrls.length
            },
            message: 'Images uploaded successfully'
        });
    }
    catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading images',
            error: error.message
        });
    }
};
// Helper function to extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
    try {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        const publicId = filename.split('.')[0];
        const folder = parts.slice(-2, -1)[0];
        return folder ? `${folder}/${publicId}` : publicId;
    }
    catch (error) {
        return null;
    }
};
