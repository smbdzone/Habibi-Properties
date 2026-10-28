import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEmail extends Document {
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId?: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  date: string;
  startTime: string;
  endTime: string;
  googleCalenderId?: string | null
}

const emailSchema: Schema = new Schema({
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

export default mongoose.model<IEmail>('Email', emailSchema);