import mongoose, { Document, Schema } from 'mongoose';

export interface IEnquiry extends Document {
    firstName: string;
    lastName?: string;
    email: string;
    phoneNumber: string;
    country: string;
    countryCode: string;
    budget: string;
    propertyType: string;
    createdAt: Date;
    updatedAt: Date;
}

const enquirySchema: Schema = new Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true
    },
    countryCode: {
        type: String,
        required: [true, 'Country code is required'],
        trim: true
    },
    budget: {
        type: String,
        required: [true, 'Budget is required'],
        trim: true
    },
    propertyType: {
        type: String,
        trim: true,
        default: 'residential'
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
enquirySchema.index({ email: 1 });
enquirySchema.index({ createdAt: -1 });

export default mongoose.model<IEnquiry>('Enquiry', enquirySchema);