import express from 'express';
import { createTestimonial, getTestimonials, getActiveTestimonials, updateTestimonial, deleteTestimonial, toggleTestimonialStatus } from '../controllers/testimonialController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { uploadTestimonial } from '../middleware/upload.js';
const router = express.Router();
// Public routes
router.get('/active', getActiveTestimonials); // Get active testimonials for frontend
// Admin routes
router.post('/', auth, adminAuth, uploadTestimonial, createTestimonial);
router.get('/', auth, adminAuth, getTestimonials);
router.put('/:id', auth, adminAuth, uploadTestimonial, updateTestimonial);
router.delete('/:id', auth, adminAuth, deleteTestimonial);
router.patch('/:id/status', auth, adminAuth, toggleTestimonialStatus);
export default router;
