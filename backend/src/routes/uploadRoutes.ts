import express from 'express';
import { uploadSingleImage, uploadMultipleImages } from '../controllers/uploadController.js';
import { uploadSingle, uploadMultiple } from '../middleware/upload.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// All upload routes require admin authentication
router.post(
  '/upload/image',
  auth,
  adminAuth,
  uploadSingle,
  uploadSingleImage
);

router.post(
  '/upload/images',
  auth,
  adminAuth,
  uploadMultiple,
  uploadMultipleImages
);

export default router;

