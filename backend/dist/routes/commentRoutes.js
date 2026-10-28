import express from 'express';
import { createComment, getCommentsByBlog, getAllComments, updateCommentStatus, getCommentsWithBlog, deleteComment, getCommentById } from '../controllers/commentController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
const router = express.Router();
// Create a new comment
router.post('/', createComment);
// Get comments for a specific blog (public route)
router.get('/blog/:blogId', getCommentsByBlog); // Changed from :blogSlug to :blogId
// Get all comments with blog details (admin route)
router.get('/admin/comments', auth, adminAuth, getCommentsWithBlog);
// Get all comments with filtering (admin route)
router.get('/admin/all', auth, adminAuth, getAllComments);
// Get comment by ID (admin route)
router.get('/admin/:id', auth, adminAuth, getCommentById);
// Update comment status (admin route)
router.patch('/admin/:id/status', auth, adminAuth, updateCommentStatus);
// Delete comment (admin route)
router.delete('/admin/:id', auth, adminAuth, deleteComment);
export default router;
