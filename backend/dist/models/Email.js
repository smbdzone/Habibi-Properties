import mongoose, { Schema, Types } from 'mongoose';
const emailSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    message: {
        type: String,
    },
    propertyId: {
        type: Types.ObjectId,
        ref: 'Property'
    },
    status: {
        type: String,
        enum: ['pending', 'responded', 'closed'],
        default: 'pending'
    },
    date: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    googleCalenderId: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});
export default mongoose.model('Email', emailSchema);
