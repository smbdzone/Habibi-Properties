

export interface IPropertyUnit {
    type: string;
    area: number;
    price: number;
    floreImage?: string;
}

export interface IPropertyAmenity {
    name: string;
    icon: string;
}

export interface IPaymentPlanPart {
    partName: string;
    percentage: number;
}

export interface IPaymentPlan {
    planName?: string;
    parts?: IPaymentPlanPart[];
}

export interface IPropertyGroup {
    name?: string;
    units?: IPropertyUnit[];
}

export interface IProperty {
    _id: string;

    type:
    | "apartment"
    | "villa"
    | "townhouse"
    | "retail"
    | "office";

    category: "residential" | "commercial";

    title: string;
    slug: string;
    location: string;
    price: number;

    forSaleLabel: "For Sale" | "For Rent";

    area: string;
    propertyType: string;

    bedrooms?: number;
    bathrooms?: number;

    description: string;

    coverImage: string;
    images: string[];

    mapUrl?: string;

    timeAgo: string;

    // SEO
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    schemaMarkup?: string;
    seoImage?: string;

    createdBy?: string;

    // Property features
    amenities: IPropertyAmenity[];

    // Payment plans
    paymentPlans: IPaymentPlan[];

    // Property groups
    propertGroups: IPropertyGroup[];

    // Location
    mapQuery: string | null;

    // Additional information
    dld?: string;
    handOver?: string;

    // Videos
    ytVideos: string[];

    paymentInstalment: string;

    // Mongoose timestamps
    createdAt: string;
    updatedAt: string;
}

export interface IBlog {
    _id: string;
    title: string;
    slug: string;
    date: string;
    views: number;
    category: string;
    image: string;
    featured: boolean;
    excerpt: string;
    author: string;

    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    schemaMarkup?: string;
    seoImage?: string;

    // Raw HTML content from Jodit editor
    content: string;

    createdAt: string;
    updatedAt: string;
}

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface IComment {
    _id: string;
    comment: string;
    name: string;
    email: string;
    saveInfo: boolean;
    status: CommentStatus;
    blog: string;
    avatar: string;
    createdAt: string;
    updatedAt: string;
}

export interface ITestimonial {
    _id: string;
    name: string;
    rating: number;
    comment: string;
    position?: string;
    company?: string;
    video?: string;
    featured: boolean;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export interface INewsletter {
    _id: string;
    email: string;
    status: 'subscribed' | 'unsubscribed';
    subscribedAt: string;
    unsubscribedAt?: string;
    source?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AdminProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    location: string;
    bio: string;
    profileImage: string;
    yearsOfExperinces?: number;
    totalSoldProperties?: number;
    locations?: number;
    socialMedia: SocialMedia;
}

export interface SocialMedia {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
}

