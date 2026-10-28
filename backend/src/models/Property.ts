import mongoose, { Document, Schema } from 'mongoose';

export interface IPropertyUnit {
    type: string;
    area: number;
    price: number;
    floreImage?: string;
}

export interface IProperty {
    type: 'apartment' | 'villa' | 'townhouse' | 'retail' | 'office';
    category: 'residential' | 'commercial';
    title: string;
    slug: string;
    location: string;
    price: number;
    forSaleLabel: 'For Sale' | 'For Rent';
    area: string;
    propertyType?: string;
    bedrooms: number;
    bathrooms: number;
    description: string;
    coverImage?: string; // Dedicated cover/preview image (falls back to images[0] if not set)
    images: string[]; // All images including cover (coverImage is also stored here as images[0])
    mapUrl?: string;
    timeAgo: string;
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    schemaMarkup?: string;
    seoImage?: string;
    createdBy?: mongoose.Types.ObjectId | string;
    amenities: Array<{
        name: string;
        icon: string;
    }>;

    paymentPlans?: Array<{
        planName?: string,
        parts?: Array<{
            partName: string,
            percentage: number
        }>
    }>;
    propertGroups?: Array<{
        name?: string;
        units?: IPropertyUnit[];
    }>;
    mapQuery?: string | null;
    dld?: string;
    handOver?: string;
    ytVideos?: string[];
    paymentInstalment?: string
}

export interface IPropertyDocument extends IProperty, Document { }

const propertySchema: Schema<IPropertyDocument> = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['apartment', 'villa', 'townhouse', 'retail', 'office']
    },
    category: {
        type: String,
        required: true,
        enum: ['residential', 'commercial']
    },
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price must be a positive number']
    },
    forSaleLabel: {
        type: String,
        enum: ['For Sale', 'For Rent'],
        default: 'For Sale'
    },
    area: {
        type: String,
        required: true
    },
    propertyType: {
        type: String,
    },
    bedrooms: {
        type: Number,
        required: false
    },
    bathrooms: {
        type: Number,
        required: false
    },
    description: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        required: false
    },
    images: [{
        type: String,
        required: true
    }],
    mapUrl: {
        type: String
    },
    timeAgo: {
        type: String,
        default: 'Recently added'
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
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: false
    },
    amenities: [{
        name: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: false,
            default: ''
        }
    }],
    paymentPlans: [
        {
            planName: {
                type: String,

            },
            parts: [
                {
                    partName: {
                        type: String,

                    },
                    percentage: {
                        type: Number,

                    },
                },
            ],
        },
    ],
    propertGroups: [
        {
            name: {
                type: String,

            },
            units: [
                {
                    type: {
                        type: String,

                    },
                    area: {
                        type: Number,

                    },
                    price: {
                        type: Number,

                    },
                    floreImage: {
                        type: String,

                    },
                },
            ],
        },
    ],
    ytVideos: {
        type: [String],
        default: [],
    },
    mapQuery: {
        type: String,
        default: null
    },
    dld: String,
    handOver: String,
    paymentInstalment: String
}, {
    timestamps: true
});

// Note: slug index is automatically created by unique: true, so we don't need to add it explicitly

export default mongoose.model<IPropertyDocument>('Property', propertySchema);