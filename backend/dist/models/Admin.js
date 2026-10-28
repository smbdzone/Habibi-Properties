import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const adminSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
    },
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin',
    },
    phone: {
        type: String,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    profileImage: {
        type: String,
        trim: true,
    },
    yearsOfExperinces: {
        type: Number,
        default: 0,
    },
    totalSoldProperties: {
        type: Number,
        default: 0,
    },
    locations: {
        type: Number,
        default: 0,
    },
    socialMedia: {
        facebook: {
            type: String,
            default: "",
        },
        instagram: {
            type: String,
            default: "",
        },
        linkedin: {
            type: String,
            default: "",
        },
        tiktok: {
            type: String,
            default: "",
        },
        youtube: {
            type: String,
            default: "",
        },
    },
    availability: {
        timezone: {
            type: String,
            default: "Asia/Karachi"
        },
        slotDuration: {
            type: Number,
            default: 30 // minutes
        },
        weekly: [
            {
                day: {
                    type: Number, // 0 = Sunday, 1 = Monday...
                    required: true
                },
                isAvailable: {
                    type: Boolean,
                    default: true
                },
                startTime: String, // "09:00"
                endTime: String // "17:00"
            }
        ]
    },
    googleAuthToken: {
        type: String,
        default: null
    },
    googleAuthConnected: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});
// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Compare password method
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};
export default mongoose.model('Admin', adminSchema);
