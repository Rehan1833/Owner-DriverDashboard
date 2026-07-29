import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'smartops_super_secret_key_123!';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
      req.userId = decoded.id;
      req.userRole = decoded.role;
      next();
    });
  } else {
    res.status(401).json({ message: 'Authorization header required.' });
  }
};
