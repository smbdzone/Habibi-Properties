import { Request, Response } from 'express';
import Property from '../models/Property.js';
import Blog from '../models/blogModel.js';
import Enquiry from '../models/enquiryModel.js';
import Newsletter from '../models/newsletterModel.js';
import Contact from '../models/Contact.js';
import Testimonial from '../models/testimonialModel.js';

export const getDashboardOverview = async (req: Request, res: Response): Promise<void> => {
    try {
        const [
            totalProperties,
            residentialProperties,
            commercialProperties,
            latestProperties,
            totalBlogs,
            latestBlogs,
            totalEnquiries,
            recentEnquiries,
            totalSubscribers,
            totalContacts,
            recentContacts,
            totalTestimonials
        ] = await Promise.all([
            Property.countDocuments(),
            Property.countDocuments({ category: 'residential' }),
            Property.countDocuments({ category: 'commercial' }),
            Property.find()
                .sort({ createdAt: -1 })
                .limit(6)
                .select('title category type price location bedrooms area createdAt')
                .lean(),
            Blog.countDocuments(),
            Blog.find()
                .sort({ createdAt: -1 })
                .limit(3)
                .select('title slug category createdAt image excerpt')
                .lean(),
            Enquiry.countDocuments(),
            Enquiry.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('firstName lastName email phoneNumber propertyType budget createdAt')
                .lean(),
            Newsletter.countDocuments({ status: 'subscribed' }),
            Contact.countDocuments(),
            Contact.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('firstName lastName email fullPhone subject status createdAt')
                .lean(),
            Testimonial.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    properties: totalProperties,
                    residentialProperties,
                    commercialProperties,
                    blogs: totalBlogs,
                    enquiries: totalEnquiries,
                    subscribers: totalSubscribers,
                    contacts: totalContacts,
                    testimonials: totalTestimonials
                },
                latestProperties,
                latestBlogs,
                recentEnquiries,
                recentContacts
            },
            message: 'Dashboard overview retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard overview',
            error: (error as Error).message
        });
    }
};

