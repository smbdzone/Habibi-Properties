import Testimonial from '../models/testimonialModel.js';
export const createTestimonial = async (req, res) => {
    try {
        const { name, rating, comment, position, company, featured = false } = req.body;
        // Validate required fields
        if (!name || !rating) {
            res.status(400).json({
                success: false,
                message: "Name, rating are required fields"
            });
            return;
        }
        if (rating !== undefined) {
            const ratingNum = Number(rating);
            // Validate rating range
            if (ratingNum < 1 || ratingNum > 5) {
                res.status(400).json({
                    success: false,
                    message: "Rating must be between 1 and 5"
                });
                return;
            }
        }
        let video;
        if (req.file) {
            const { uploadToCloudinary } = await import('../config/cloudinary.js');
            video = await uploadToCloudinary({ buffer: req.file.buffer, mimetype: req.file.mimetype }, 'habibi-properties/testimonial');
        }
        // Create new testimonial
        const newTestimonial = new Testimonial({
            name,
            rating: Number(rating),
            comment,
            position,
            company,
            video,
            featured,
            status: 'active'
        });
        await newTestimonial.save();
        res.status(201).json({
            success: true,
            message: "Testimonial created successfully",
            data: newTestimonial
        });
    }
    catch (error) {
        console.error("Error creating testimonial:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
export const getTestimonials = async (req, res) => {
    try {
        const { featured, status = 'active', page = 1, limit = 10 } = req.query;
        let filter = { status };
        if (featured !== undefined) {
            filter.featured = featured === 'true';
        }
        const testimonials = await Testimonial.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await Testimonial.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: testimonials,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalTestimonials: total
            },
            message: "Testimonials retrieved successfully"
        });
    }
    catch (error) {
        console.error("Error fetching testimonials:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
export const getActiveTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ status: 'active' })
            .sort({ rating: -1, createdAt: -1 })
            .limit(10);
        res.status(200).json({
            success: true,
            data: testimonials,
            message: "Active testimonials retrieved successfully"
        });
    }
    catch (error) {
        console.error("Error fetching active testimonials:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
export const updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        if (updateData.rating !== undefined) {
            const rating = Number(updateData.rating);
            // Validate rating if provided
            if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
                res.status(400).json({
                    success: false,
                    message: "Rating must be between 1 and 5"
                });
                return;
            }
            updateData.rating = rating;
        }
        if (req.file) {
            const { uploadToCloudinary } = await import('../config/cloudinary.js');
            const video = await uploadToCloudinary({ buffer: req.file.buffer, mimetype: req.file.mimetype }, 'habibi-properties/testimonial');
            updateData.video = video;
        }
        const testimonial = await Testimonial.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!testimonial) {
            res.status(404).json({
                success: false,
                message: "Testimonial not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: testimonial,
            message: "Testimonial updated successfully"
        });
    }
    catch (error) {
        console.error("Error updating testimonial:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
export const deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const testimonial = await Testimonial.findByIdAndDelete(id);
        if (!testimonial) {
            res.status(404).json({
                success: false,
                message: "Testimonial not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Testimonial deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting testimonial:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
export const toggleTestimonialStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const testimonial = await Testimonial.findById(id);
        if (!testimonial) {
            res.status(404).json({
                success: false,
                message: "Testimonial not found"
            });
            return;
        }
        testimonial.status = testimonial.status === 'active' ? 'inactive' : 'active';
        await testimonial.save();
        res.status(200).json({
            success: true,
            data: testimonial,
            message: `Testimonial ${testimonial.status} successfully`
        });
    }
    catch (error) {
        console.error("Error toggling testimonial status:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
