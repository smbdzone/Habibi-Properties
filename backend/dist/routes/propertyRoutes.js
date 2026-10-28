// routes/propertyRoutes.js
import express from 'express';
import { getProperties, getPropertyById, getPropertyBySlug, getSimilarProperties, getSimilarPropertiesBySlug, createProperty, updateProperty, deleteProperty, getPropertySEO, getLocations } from '../controllers/propertyController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { uploadProperty } from '../middleware/upload.js';
const router = express.Router();
// PUBLIC routes - GET requests (anyone can access)
router.get('/properties', getProperties);
router.get('/properties/slug/:slug', getPropertyBySlug); // Dedicated slug route
router.get('/properties/seo/:slug', getPropertySEO); // SEO metadata endpoint
router.get('/properties/similar/slug/:slug/:type', getSimilarPropertiesBySlug); // Similar by slug
router.get('/properties/similar/:id/:type', getSimilarProperties); // Similar by id/slug
router.get('/properties/locations', getLocations);
router.get('/properties/:id', getPropertyById); // Handles both ID and slug
// ADMIN ONLY routes - POST, PUT, DELETE requests
router.post('/properties', auth, adminAuth, uploadProperty, createProperty);
router.put('/properties/:id', auth, adminAuth, uploadProperty, updateProperty);
router.delete('/properties/:id', auth, adminAuth, deleteProperty);
export default router;
