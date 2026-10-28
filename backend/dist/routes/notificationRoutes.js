import express from 'express';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } from '../controllers/notificationController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
const router = express.Router();
// All notification routes require admin authentication
router.get('/notifications', auth, adminAuth, getNotifications);
router.patch('/notifications/:id/read', auth, adminAuth, markAsRead);
router.patch('/notifications/read-all', auth, adminAuth, markAllAsRead);
router.delete('/notifications/:id', auth, adminAuth, deleteNotification);
router.delete('/notifications', auth, adminAuth, clearAllNotifications);
export default router;
