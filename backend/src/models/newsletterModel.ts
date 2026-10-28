import mongoose, { Document, Schema } from 'mongoose';

export interface INewsletter extends Document {
    email: string;
    status: 'subscribed' | 'unsubscribed';
    subscribedAt: Date;
    unsubscribedAt?: Date;
    source?: string;
}

const newsletterSchema: Schema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    status: {
        type: String,
        enum: ['subscribed', 'unsubscribed'],
        default: 'subscribed'
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    unsubscribedAt: {
        type: Date
    },
    source: {
        type: String,
        default: 'website'
    }
}, {
    timestamps: true
});

// Create indexes for better performance
// Note: email index is automatically created by unique: true, so we don't need to add it explicitly
newsletterSchema.index({ status: 1 });
newsletterSchema.index({ subscribedAt: -1 });

export default mongoose.model<INewsletter>('Newsletter', newsletterSchema);