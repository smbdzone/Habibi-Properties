import express from 'express';
import {
    getAllBlogs,
    getBlogBySlug,
    getBlogById,
    getFilteredBlogs,
    getFeaturedBlogs,
    getRelatedBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    getBlogSEO
} from '../controllers/blogController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { uploadBlog } from '../middleware/upload.js';

const router = express.Router();

// PUBLIC routes - GET requests (anyone can access)
router.get('/blogs', getAllBlogs);
router.get('/blogs/featured', getFeaturedBlogs);
router.get('/blogs/filter', getFilteredBlogs);
router.get('/blogs/related/:slug', getRelatedBlogs);
router.get('/blogs/seo/:slug', getBlogSEO); // SEO metadata endpoint
router.get('/blogs/:slug', getBlogBySlug);

// ADMIN ONLY routes - GET, POST, PUT, DELETE requests
router.get('/blogs/admin/:id', auth, adminAuth, getBlogById);
router.post('/blogs', auth, adminAuth, uploadBlog, createBlog);
router.put('/blogs/:id', auth, adminAuth, uploadBlog, updateBlog);
router.delete('/blogs/:id', auth, adminAuth, deleteBlog);

export default router;