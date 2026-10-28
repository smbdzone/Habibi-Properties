import mongoose, { Schema } from 'mongoose';
const contactSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [false, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    countryCode: {
        type: String,
        required: [false, 'Country code is required']
    },
    countryName: {
        type: String,
        required: [false, 'Country name is required']
    },
    phone: {
        type: String,
        required: [false, 'Phone number is required'],
        trim: true
    },
    fullPhone: {
        type: String,
        required: [false, 'Full phone number is required']
    },
    subject: {
        type: String,
        trim: false,
        maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [false, 'Message is required'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: ['new', 'read', 'replied', 'archived'],
        default: 'new'
    }
}, {
    timestamps: true
});
// Create indexes for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });
export default mongoose.model('Contact', contactSchema);
