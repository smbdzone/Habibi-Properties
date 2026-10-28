// File validation utility

// Executable file extensions to block
const BLOCKED_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.app', '.deb', '.rpm', '.msi', '.dmg', '.sh', '.bash', '.ps1', '.sh',
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

export interface FileValidationResult {
    isValid: boolean;
    error?: string;
    fileType?: 'image' | 'video' | 'document';
}

/**
 * Validates a file to ensure it's not an executable and matches allowed types
 */
export const validateFile = (
    file: File,
    allowedTypes: ('image' | 'video' | 'document')[] = ['image']
): FileValidationResult => {
    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(fileExtension)) {
        return {
            isValid: false,
            error: `Executable files are not allowed. File extension "${fileExtension}" is blocked.`,
        };
    }

    // Check MIME type
    if (BLOCKED_MIME_TYPES.includes(file.type)) {
        return {
            isValid: false,
            error: `Executable files are not allowed. File type "${file.type}" is blocked.`,
        };
    }

    // Determine file type
    let fileType: 'image' | 'video' | 'document' | undefined;
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
        fileType = 'image';
    } else if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
        fileType = 'video';
    } else if (ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
        fileType = 'document';
    }

    // Check if file type is allowed
    if (!fileType) {
        return {
            isValid: false,
            error: `File type "${file.type}" is not supported. Allowed types: ${allowedTypes.join(', ')}`,
        };
    }

    if (!allowedTypes.includes(fileType)) {
        return {
            isValid: false,
            error: `File type "${fileType}" is not allowed for this upload. Allowed types: ${allowedTypes.join(', ')}`,
        };
    }

    // File size limits (50MB for videos, 10MB for images, 20MB for documents)
    const maxSizes: Record<string, number> = {
        image: 10 * 1024 * 1024, // 10MB
        video: 50 * 1024 * 1024, // 50MB
        document: 20 * 1024 * 1024, // 20MB
    };

    const maxSize = maxSizes[fileType] || 10 * 1024 * 1024;
    if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        return {
            isValid: false,
            error: `File size exceeds the maximum allowed size of ${maxSizeMB}MB for ${fileType} files.`,
        };
    }

    return {
        isValid: true,
        fileType,
    };
};

/**
 * Gets the accept attribute string for file input based on allowed types
 */
export const getAcceptString = (
    allowedTypes: ('image' | 'video' | 'document')[]
): string => {
    const acceptMap: Record<string, string[]> = {
        image: ALLOWED_IMAGE_TYPES,
        video: ALLOWED_VIDEO_TYPES,
        document: ALLOWED_DOCUMENT_TYPES.map((type) => {
            // Convert MIME types to file extensions for accept attribute
            if (type.includes('pdf')) return '.pdf';
            if (type.includes('word')) return '.doc,.docx';
            if (type.includes('excel')) return '.xls,.xlsx';
            if (type.includes('powerpoint')) return '.ppt,.pptx';
            if (type.includes('text')) return '.txt';
            if (type.includes('csv')) return '.csv';
            if (type.includes('zip')) return '.zip,.rar,.7z';
            return '';
        }).filter(Boolean),
    };

    const acceptTypes: string[] = [];
    allowedTypes.forEach((type) => {
        acceptTypes.push(...acceptMap[type]);
    });

    return acceptTypes.join(',');
};

