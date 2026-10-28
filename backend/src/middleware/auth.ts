import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/** Must match dashboard APP_STORAGE_KEYS.token */
const AUTH_COOKIE_NAME = 'mary_homes_admin_token';

interface JwtPayload {
  id: string;
  role?: string;
}

const auth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from cookie first, then from Authorization header
    let token: string | undefined =
      req.cookies?.[AUTH_COOKIE_NAME] ?? req.header('Authorization');

    if (!token) {
      res.status(401).json({
        message: 'No authentication token, access denied',
      });
      return;
    }

    // If from header, strip "Bearer " prefix
    const actualToken = token.startsWith('Bearer ')
      ? token.slice(7)
      : token;

    // Verify token
    const verified = jwt.verify(actualToken, process.env.JWT_SECRET!) as JwtPayload;
    
    // Add user ID to request as string
    req.user = verified.id;
    next();
    
  } catch (error) {
    res.status(401).json({ 
      message: 'Invalid token', 
      error: (error as Error).message 
    });
  }
};

export default auth;