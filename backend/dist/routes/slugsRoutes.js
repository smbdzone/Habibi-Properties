import express from 'express';
import { getSlugs } from '../controllers/slugsController.js';
const router = express.Router();
// PUBLIC route - GET request (anyone can access)
router.get('/slugs', getSlugs);
export default router;
