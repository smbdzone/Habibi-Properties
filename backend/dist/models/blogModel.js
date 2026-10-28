import mongoose, { Schema } from 'mongoose';
const blogSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    date: {
        type: String,
        required: [true, 'Date is required']
    },
    views: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Image is required']
    },
    featured: {
        type: Boolean,
        default: false
    },
    excerpt: {
        type: String,
        required: [true, 'Excerpt is required'],
        maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    author: {
        type: String,
        required: [true, 'Author is required'],
        default: 'Admin'
    },
    seoTitle: {
        type: String,
        trim: true,
        maxlength: [60, 'SEO Title should not exceed 60 characters']
    },
    seoDescription: {
        type: String,
        trim: true,
        maxlength: [300, 'SEO Description should not exceed 300 characters']
    },
    canonicalUrl: {
        type: String,
        trim: true
    },
    schemaMarkup: {
        type: String,
        trim: true
    },
    seoImage: {
        type: String,
        trim: true
    },
    // Content is stored as raw HTML string from Jodit editor
    content: {
        type: String,
        required: [true, 'Content is required']
    }
}, {
    timestamps: true
});
// Create indexes for better performance
// Note: slug index is automatically created by unique: true, so we don't need to add it explicitly
blogSchema.index({ featured: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ views: -1 });
export default mongoose.model('Blog', blogSchema);
