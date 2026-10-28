import Comment from '../models/commentModel.js';
import { Types } from 'mongoose';
import { createNotification } from './notificationController.js';
export const createComment = async (req, res) => {
    try {
        const { comment, name, email, saveInfo, blog } = req.body;
        // Validate required fields
        if (!comment || !name || !email || !blog) {
            res.status(400).json({
                success: false,
                message: "Comment, name, email, and blog ID are required fields"
            });
            return;
        }
        // Validate that blog ID is a valid MongoDB ObjectId
        if (!Types.ObjectId.isValid(blog)) {
            res.status(400).json({
                success: false,
                message: "Invalid blog ID format"
            });
            return;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
            return;
        }
        // Generate avatar URL using DiceBear API
        const generateAvatar = (userName, userEmail) => {
            const seed = userEmail || userName || Math.random().toString(36).substring(7);
            return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
        };
        const avatar = generateAvatar(name, email);
        // Create new comment with avatar
        const newComment = new Comment({
            comment,
            name,
            email,
            saveInfo,
            blog, // Now storing ObjectId instead of slug
            avatar, // Add the generated avatar
            status: 'pending'
        });
        await newComment.save();
        // Create notification for new comment
        await createNotification('comment', `New comment from ${name} on a blog post (pending approval)`, String(newComment._id));
        res.status(201).json({
            success: true,
            message: "Comment submitted successfully and is pending approval",
            data: newComment
        });
    }
    catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
export const getCommentsByBlog = async (req, res) => {
    try {
        const { blogId } = req.params; // Changed from blogSlug to blogId
        const { status = 'approved' } = req.query;
        // Validate that blogId is a valid MongoDB ObjectId
        if (!Types.ObjectId.isValid(blogId)) {
            res.status(400).json({
                success: false,
                message: "Invalid blog ID format"
            });
            return;
        }
        const comments = await Comment.find({
            blog: blogId, // Changed from blogSlug to blog
            status
        }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: comments,
            message: "Comments retrieved successfully"
        });
    }
    catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
export const getAllComments = async (req, res) => {
    try {
        const { status, page = 1, limit = 10, blogId } = req.query;
        let filter = {};
        if (status) {
            filter.status = status;
        }
        if (blogId) {
            // Validate that blogId is a valid MongoDB ObjectId if provided
            if (!Types.ObjectId.isValid(blogId)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid blog ID format"
                });
                return;
            }
            filter.blog = blogId;
        }
        const comments = await Comment.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await Comment.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: comments,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalComments: total
            },
            message: "Comments retrieved successfully"
        });
    }
    catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
export const updateCommentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'pending', 'approved', or 'rejected'"
            });
            return;
        }
        const comment = await Comment.findByIdAndUpdate(id, { status }, { new: true });
        if (!comment) {
            res.status(404).json({
                success: false,
                message: "Comment not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: comment,
            message: `Comment ${status} successfully`
        });
    }
    catch (error) {
        console.error("Error updating comment status:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findByIdAndDelete(id);
        if (!comment) {
            res.status(404).json({
                success: false,
                message: "Comment not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
export const getCommentById = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate({
            path: 'blog',
            select: 'title slug',
            options: { lean: false }
        });
        if (!comment) {
            res.status(404).json({
                success: false,
                message: "Comment not found"
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: comment,
            message: "Comment retrieved successfully"
        });
    }
    catch (error) {
        console.error("Error fetching comment:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
// New method to get comments with blog population
export const getCommentsWithBlog = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        let filter = {};
        if (status) {
            filter.status = status;
        }
        const comments = await Comment.find(filter)
            .populate({
            path: 'blog',
            select: 'title slug'
        })
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await Comment.countDocuments(filter);
        // Log first comment to debug blog population
        if (comments.length > 0 && comments[0].blog) {
            const blogData = typeof comments[0].blog === 'object' && comments[0].blog !== null
                ? comments[0].blog
                : comments[0].blog;
            console.log('Sample comment blog data:', blogData);
        }
        res.status(200).json({
            success: true,
            data: comments,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalComments: total
            },
            message: "Comments with blog details retrieved successfully"
        });
    }
    catch (error) {
        console.error("Error fetching comments with blog:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
