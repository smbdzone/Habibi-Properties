import express from 'express';
import { getHomepageSEO, updateHomepageSEO } from '../controllers/settingsController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Public endpoint to get homepage SEO
router.get('/settings/homepage/seo', getHomepageSEO);

// Protected endpoint to update homepage SEO
router.put('/admin/settings/homepage/seo', auth, adminAuth, updateHomepageSEO);

export default router;

