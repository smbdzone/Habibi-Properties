import { Request, Response, NextFunction } from 'express';
import Admin from '../models/Admin.js';

const adminAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = req.user as string;
    
    // Find admin and verify
    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      res.status(404).json({ 
        success: false,
        message: 'Admin not found' 
      });
      return;
    }

    if (admin.role !== 'admin') {
      res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin rights required.' 
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error during admin verification' 
    });
  }
};

export default adminAuth;