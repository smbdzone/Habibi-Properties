import express from 'express';
import { registerAdmin, loginAdmin, getAdminMe, updateAdminProfile, aboutInfo, googleAuth, googleAuthCallback } from '../controllers/adminAuthController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { uploadProfileImage } from '../middleware/upload.js';
const router = express.Router();
// POST /api/admin/auth/register - Register new admin (use this to create first admin)
router.post('/auth/register', registerAdmin);
router.get('/auth/about/:adminId', aboutInfo);
// POST /api/admin/auth/login - Login admin
router.post('/auth/login', loginAdmin);
// GET /api/admin/auth/me - Get current admin (protected)
router.get('/auth/me', auth, adminAuth, getAdminMe);
// PUT /api/admin/auth/profile - Update admin profile (protected)
router.put('/auth/profile', auth, adminAuth, uploadProfileImage, updateAdminProfile);
router.get("/auth/connect", googleAuth);
router.get("/google-calendar/callback", googleAuthCallback);
export default router;
