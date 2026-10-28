import express from 'express';
import { getDashboardOverview } from '../controllers/dashboardController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/admin/dashboard/overview', auth, adminAuth, getDashboardOverview);

export default router;

