import express from 'express';
import { subscribeNewsletter, unsubscribeNewsletter, getSubscribers, getSubscriberCount, getSubscriberById, deleteSubscriber } from '../controllers/newsletterController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
const router = express.Router();
// Public routes
router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);
// Admin routes
router.get('/subscribers', auth, adminAuth, getSubscribers);
router.get('/count', auth, adminAuth, getSubscriberCount);
router.get('/subscribers/:id', auth, adminAuth, getSubscriberById);
router.delete('/subscribers/:id', auth, adminAuth, deleteSubscriber);
export default router;
