import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  type: 'subscriber' | 'contact' | 'enquiry' | 'newsletter' | 'property' | 'blog' | 'comment';
  message: string;
  read: boolean;
  relatedId?: string; // ID of related entity (property, contact, etc.)
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema: Schema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['subscriber', 'contact', 'enquiry', 'newsletter', 'property', 'blog', 'comment']
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedId: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Create indexes for better performance
notificationSchema.index({ read: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });

export default mongoose.model<INotification>('Notification', notificationSchema);

