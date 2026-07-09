import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // If the user's role is not in the array of allowed roles
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'Forbidden: You do not have permission to perform this action.' 
      });
      return;
    }
    
    // User is authorized
    next();
  };
};
