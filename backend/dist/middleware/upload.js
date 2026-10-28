import multer from 'multer';
// Configure multer to use memory storage (for Cloudinary)
const storage = multer.memoryStorage();
// Executable file extensions to block
const BLOCKED_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.app', '.deb', '.rpm', '.msi', '.dmg', '.sh', '.bash', '.ps1',
    '.run', '.bin', '.dll', '.so', '.dylib'
];
// Executable MIME types to block
const BLOCKED_MIME_TYPES = [
    'application/x-msdownload',
    'application/x-msdos-program',
    'application/x-executable',
    'application/x-ms-installer',
    'application/x-sh',
    'application/x-shellscript',
    'application/x-bat',
    'application/x-cmd',
    'application/javascript',
    'application/x-javascript',
    'application/java-archive',
    'application/x-apple-diskimage',
    'application/vnd.debian.binary-package',
    'application/x-rpm',
    'application/x-ms-wim',
];
// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
];
// Allowed video MIME types
const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/ogg',
    'video/x-matroska',
];
// Allowed document/file MIME types
const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
];
// File filter to accept images, videos, and documents but block executables
const fileFilter = (req, file, cb) => {
    // Check if file extension is blocked
    const fileExtension = '.' + file.originalname.split('.').pop()?.toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(fileExtension)) {
        cb(new Error(`Executable files are not allowed. File extension "${fileExtension}" is blocked.`));
        return;
    }
    // Check if MIME type is blocked
    if (BLOCKED_MIME_TYPES.includes(file.mimetype)) {
        cb(new Error(`Executable files are not allowed. File type "${file.mimetype}" is blocked.`));
        return;
    }
    // Check if MIME type is allowed (images, videos, or documents)
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
    const isDocument = ALLOWED_DOCUMENT_TYPES.includes(file.mimetype);
    if (isImage || isVideo || isDocument) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type "${file.mimetype}" is not allowed. Only images, videos, and documents are permitted.`));
    }
};
// Configure multer with increased file size limits for videos
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit (for videos)
    },
    fileFilter: fileFilter,
});
// Single file upload middleware
export const uploadSingle = upload.single('image');
// Multiple files upload middleware
export const uploadMultiple = upload.array('images', 10); // Max 10 images
// Fields upload middleware (for different field names)
export const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'amenityIcons', maxCount: 20 }, // For amenity icon uploads
]);
// Property upload middleware (for property creation with amenities)
export const uploadProperty = upload.fields([
    { name: 'image', maxCount: 1 }, // Cover image
    { name: 'images', maxCount: 10 }, // Additional images (max 10)
    { name: 'seoImage', maxCount: 1 }, // SEO image for social sharing
    { name: 'amenityIcons', maxCount: 20 }, // Amenity icons
    { name: 'unitImages', maxCount: 50 },
]);
// Testimonial video
export const uploadTestimonial = upload.single('video');
// Profile image upload middleware
export const uploadProfileImage = upload.single('profileImage');
// Blog upload middleware (featured image + optional SEO image)
export const uploadBlog = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'seoImage', maxCount: 1 },
]);
