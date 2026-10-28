import mongoose, { Schema } from 'mongoose';
const commentSchema = new Schema({
    comment: {
        type: String,
        required: [true, 'Comment is required'],
        trim: true,
        minlength: [1, 'Comment cannot be empty'],
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [1, 'Name cannot be empty'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    saveInfo: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    blog: {
        type: Schema.Types.ObjectId, // Changed to ObjectId
        ref: 'Blog', // Reference to Blog model
        required: [true, 'Blog reference is required']
    },
    avatar: {
        type: String,
        default: "" // Add this field
    }
}, {
    timestamps: true
});
// Create indexes for better query performance
commentSchema.index({ email: 1 });
commentSchema.index({ status: 1 });
commentSchema.index({ blog: 1 }); // Updated index
commentSchema.index({ createdAt: -1 });
commentSchema.index({ blog: 1, status: 1 }); // Updated index
export default mongoose.model('Comment', commentSchema);
