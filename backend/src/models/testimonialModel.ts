import mongoose, { Document, Schema } from 'mongoose';

export interface ITestimonial extends Document {
    name: string;
    rating: number;
    comment: string;
    position?: string;
    company?: string;
    video?: string;
    featured: boolean;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

const testimonialSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        default: '',
    },
    position: {
        type: String,
        trim: true,
        maxlength: [100, 'Position cannot exceed 100 characters']
    },
    company: {
        type: String,
        trim: true,
        maxlength: [100, 'Company cannot exceed 100 characters']
    },
    video: {
        type: String,
        default: ""
    },
    featured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Create indexes for better performance
testimonialSchema.index({ featured: 1 });
testimonialSchema.index({ status: 1 });
testimonialSchema.index({ rating: -1 });
testimonialSchema.index({ createdAt: -1 });

export default mongoose.model<ITestimonial>('Testimonial', testimonialSchema);