import { AdminProfile, IBlog, IComment, IProperty, ITestimonial } from "@/components/types/types";
import { apiClient } from "./apiClient"

interface SinglePropertyRes {
    success?: boolean,
    message?: string,
    data: IProperty,
}

interface PropertyLocationRes {
    success?: boolean,
    message?: string,
    data: {
        label: string,
        value: string
    }[],
}

interface PropertyRes {
    success?: boolean,
    message?: string,
    data: IProperty[],
    pagination?: {
        currentPage?: number | string,
        totalPages?: number | string,
        totalProperties?: number | string,
    },
}

interface SimilarPropertyRes {
    success?: boolean,
    message?: string,
    data: IProperty[],
}

interface BlogRes {
    success?: boolean,
    message?: string,
    data: IBlog[],
    pagination?: {
        currentPage?: number | string,
        totalPages?: number | string,
        totalProperties?: number | string,
    },
}

interface SingleBlogRes {
    success?: boolean,
    message?: string,
    data: IBlog,
}

interface SimilarBlogsRes {
    success?: boolean,
    message?: string,
    data: IBlog[],
}

interface TestimonialRes {
    success: boolean;
    message?: string;
    data: ITestimonial[];
}

export interface CommentRes {
    success: boolean;
    message?: string;
    data: IComment[];
}
export interface AdminProfileResponse {
    success: boolean;
    data: AdminProfile;
}

export interface IPropertySEO {
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    schemaMarkup?: string;
    seoImage?: string;
}

// Properties Related Api calls

export const fetchProperties = async () => {
    const res = await apiClient<PropertyRes>('/properties', {
        next: { revalidate: 60 },
    });
    return res.data;
}

export const fetchPropertiesPag = async (query?: string) => {
    const res = await apiClient<PropertyRes>(`/properties?${query}`, {
        next: { revalidate: 60 },
    });
    return res;
}

export const fetchSingleProperty = async (slug: string) => {
    const res = await apiClient<SinglePropertyRes>(`/properties/slug/${slug}`);
    return res.data;
};
export const fetchSimilarProperties = async (slug: string, type?: string) => {
    const res = await apiClient<SimilarPropertyRes>(`/properties/similar/slug/${slug}/${type}`, {
        next: { revalidate: 60 },
    });
    return res.data;
};



export const fetchPropertiesLocations = async () => {
    const res = await apiClient<PropertyLocationRes>(`/properties/locations`, {
        next: { revalidate: 60 },
    });
    return res.data;
};

export const fetchPropertySeo = async (slug: string) => {
    const res = await apiClient(`/properties/seo/${slug}`, {
        next: { revalidate: 60 },
    });
    return res.data;
};

// Blogs Related Api Calls

export const fetchBlogs = async () => {
    const res = await apiClient<BlogRes>('/blogs', {
        next: { revalidate: 60 },
    });
    return res.data;
}

export const fetchSingleBlog = async (slug: string) => {
    const res = await apiClient<SingleBlogRes>(`/blogs/${slug}`, {
        next: { revalidate: 60 },
    });
    return res.data;
};
export const fetchSimilarBlogs = async (slug: string) => {
    const res = await apiClient<SimilarBlogsRes>(`/blogs/related/${slug}`, {
        next: { revalidate: 60 },
    });
    return res.data;
};

export const fetchBlogSeo = async () => { };

//Testimonial Related Api calls
export const fetchTestimonial = async () => {
    const res = await apiClient<TestimonialRes>(`/testimonials/active`, {
        next: { revalidate: 60 },
    });
    return res.data;
};

//Newsletter Related Api calls

export const subscribeNewsletter = async (email: string) => {
    const res = await apiClient(`/newsletter/subscribe`, {
        method: "POST",
        body: JSON.stringify({ email: email })
    })
    return res;
}

//Comment Related Api calls

export const commentBlog = async (form: any) => {

    const res = await apiClient(`/comments`, {
        method: "POST",
        body: JSON.stringify(form)
    })
    return res;
}

export const fetchComments = async (id: string) => {
    const res = await apiClient<CommentRes>(`/comments/blog/${id}`, {
        next: { revalidate: 60 },
    });
    return res.data;
};

//Appointment api calls

export const fetchSlots = async (date: string) => {
    const res = await apiClient<CommentRes>(`/slots`, {
        method: "POST",
        body: JSON.stringify({ date: date, id: process.env.NEXT_PUBLIC_ADMIN_ID })
    });

    return res;
}

export const createAppointment = async (form: any) => {
    const res = await apiClient(`/emails`, {
        method: "POST",
        body: JSON.stringify(form)
    });

    return res;
}


//contact us api call

export const contactSendMessage = async (form: any) => {
    const res = await apiClient(`/contact`, {
        method: "POST",
        body: JSON.stringify(form)
    });

    return res;
}


export const getAbout = async () => {
    const res = await apiClient<AdminProfileResponse>(`/admin/auth/about/${process.env.NEXT_PUBLIC_ADMIN_ID}`, {
        next: { revalidate: 60 },
    });
    return res;
}


export const SendEnquiry = async (form: any) => {
    const res = await apiClient(`/enquiries`, {
        method: "POST",
        body: JSON.stringify(form)
    });

    return res;
}