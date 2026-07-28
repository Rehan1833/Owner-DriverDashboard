import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'smartops_super_secret_key_123!';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, async (err, decoded: any) => {
      if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
      
      try {
        const user = await User.findById(decoded.id);
        if (!user) {
          return res.status(401).json({ message: 'User record not found.' });
        }

        // Enforce OTP / email verification for local provider
        if (user.provider === 'local' && !user.isEmailVerified) {
          return res.status(403).json({
            message: 'Email verification pending. Please verify your account using the OTP code sent to your Gmail or mobile number.'
          });
        }

        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
      } catch (dbErr: any) {
        return res.status(500).json({ message: 'Authorization check failed due to database error.' });
      }
    });
  } else {
    res.status(401).json({ message: 'Authorization header required.' });
  }
};
