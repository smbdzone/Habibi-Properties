import express from 'express';
import { 
    createEnquiry, 
    getAllEnquiries, 
    getEnquiryById,
    deleteEnquiry
} from '../controllers/enquiryController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// POST /api/enquiries - Create new enquiry
router.post('/enquiries', createEnquiry);

// GET /api/enquiries - Get all enquiries
router.get('/enquiries', auth, adminAuth, getAllEnquiries);

// GET /api/enquiries/:id - Get enquiry by ID
router.get('/enquiries/:id', auth, adminAuth, getEnquiryById);

// DELETE /api/enquiries/:id - Delete enquiry
router.delete('/enquiries/:id', auth, adminAuth, deleteEnquiry);

export default router;