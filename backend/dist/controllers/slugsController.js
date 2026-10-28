import Blog from "../models/blogModel.js";
import Property from "../models/Property.js";
export const getSlugs = async (req, res) => {
    try {
        // Fetch slugs, updatedAt, and createdAt from blogs
        const blogSlugs = await Blog.find({}, { slug: 1, updatedAt: 1, createdAt: 1, _id: 0 }).lean();
        const blogs = blogSlugs.map((blog) => ({
            slug: blog.slug,
            updatedAt: blog.updatedAt || blog.createdAt,
        }));
        // Fetch slugs, updatedAt, and createdAt from properties
        const propertySlugs = await Property.find({}, { slug: 1, updatedAt: 1, createdAt: 1, _id: 0 }).lean();
        const properties = propertySlugs.map((property) => ({
            slug: property.slug,
            updatedAt: property.updatedAt || property.createdAt,
        }));
        res.status(200).json({
            success: true,
            data: {
                blogs,
                properties,
            },
        });
    }
    catch (error) {
        console.error("Error fetching slugs:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
