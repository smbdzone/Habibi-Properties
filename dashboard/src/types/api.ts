export type AdminRole = "admin";

export interface Testimonial {
  _id: string;
  name: string;
  rating: number; // 1-5
  comment: string;
  position?: string;
  company?: string;
  video?: string;
  featured: boolean;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialPayload {
  name: string;
  rating: number;
  comment: string;
  position?: string;
  company?: string;
  video?: string;
  featured?: boolean;
  status?: "active" | "inactive";
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  phone?: string;
  location?: string;
  bio?: string;
  profileImage?: string;
}

export type PropertyCategory = "residential" | "commercial";
export type PropertyType =
  | "apartment"
  | "villa"
  | "townhouse"
  | "retail"
  | "office";

export interface PropertyAmenity {
  name: string;
  icon: string;
}

export interface PaymentPlan {
  planName: string,
  parts: {
    partName: string,
    percentage: number
  }[]
}

export interface youtubeVideo {
  id: number,
  link: string
}
export interface IPropertyUnit {
  type: string;
  area: number;
  price: number;
  floreImage: string;
}

export interface propertyGroups {
  name: string;
  units: IPropertyUnit[];
}

export interface Property {
  _id: string;
  title: string;
  category: PropertyCategory;
  type: PropertyType;
  location: string;
  price: string;
  forSaleLabel?: string;
  area: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  description: string;
  images: string[];
  mapUrl?: string;
  timeAgo?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  schemaMarkup?: string;
  seoImage?: string;
  amenities: PropertyAmenity[];
  paymentPlans?: PaymentPlan[];
  propertGroups?: propertyGroups[];
  dld?: string;
  handOver?: string;
  paymentInstalment?: string;
  ytVideos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyPayload
  extends Omit<
    Property,
    "_id" | "createdAt" | "updatedAt" | "amenities"
  > {
  amenities: PropertyAmenity[];
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  date: string;
  category: string;
  image: string;
  excerpt: string;
  featured: boolean;
  views?: number;
  author: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  schemaMarkup?: string;
  seoImage?: string;
  // Content is raw HTML string from Jodit editor
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPayload
  extends Omit<
    Blog,
    "_id" | "createdAt" | "updatedAt" | "views" | "author"
  > {
  author?: string;
}

export interface Enquiry {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber: string;
  country: string;
  countryCode: string;
  budget: string;
  propertyType: string;
  createdAt: string;
}

export interface ContactMessage {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullPhone: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
}

export interface Subscriber {
  _id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  subscribedAt: string;
  source?: string;
}

export interface Comment {
  _id: string;
  comment: string;
  name: string;
  email: string;
  saveInfo: boolean;
  status: "pending" | "approved" | "rejected";
  blog: string | {
    _id: string;
    title: string;
    slug: string;
  };
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Email {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId?: {
    title?: string
  };
  propertyPrice?: string;
  propertyType?: string;
  propertyLocation?: string;
  date?: string;
  startTime?: string;
  endTime?: string;

  status: "pending" | "responded" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface DashboardOverview {
  stats: {
    properties: number;
    residentialProperties: number;
    commercialProperties: number;
    blogs: number;
    enquiries: number;
    subscribers: number;
    contacts: number;
    testimonials: number;
  };
  latestProperties: Array<
    Pick<
      Property,
      "_id" | "title" | "type" | "price" | "location" | "bedrooms" | "area" | "createdAt"
    >
  >;
  latestBlogs: Array<Pick<Blog, "_id" | "title" | "slug" | "category" | "createdAt" | "image" | "excerpt">>;
  recentEnquiries: Array<
    Pick<
      Enquiry,
      | "_id"
      | "firstName"
      | "lastName"
      | "email"
      | "phoneNumber"
      | "propertyType"
      | "budget"
      | "createdAt"
    >
  >;
  recentContacts: Array<
    Pick<ContactMessage, "_id" | "firstName" | "lastName" | "email" | "fullPhone" | "subject" | "status" | "createdAt">
  >;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords?: number;
    totalSubscribers?: number;
    totalContacts?: number;
  };
}


export interface isAvailability {
  day: number;
  dayName: string;
  isAvailable: boolean;
  startTime: string;
  endTime: string
}