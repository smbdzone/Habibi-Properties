import express from 'express';
import { createContact, getAllContacts, getContactById, updateContactStatus, deleteContact, getCountries } from '../controllers/contactController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
const router = express.Router();
// Public routes
router.get('/countries', getCountries);
router.post('/', createContact);
// Admin routes
router.get('/admin/contacts', auth, adminAuth, getAllContacts);
router.get('/admin/contacts/:id', auth, adminAuth, getContactById);
router.patch('/admin/contacts/:id/status', auth, adminAuth, updateContactStatus);
router.delete('/admin/contacts/:id', auth, adminAuth, deleteContact);
export default router;
