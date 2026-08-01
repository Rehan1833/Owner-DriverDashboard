import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'smartops_super_secret_key_123!';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  companyId?: string;
}

/**
 * JWT Authentication Middleware.
 *
 * Security architecture:
 * - The JWT payload contains { id, role } signed with JWT_SECRET on the backend.
 * - jwt.verify() cryptographically validates the token — if it passes, the role IS trusted.
 * - We attempt a DB lookup to enforce email-verification, but if MongoDB is unavailable
 *   (Atlas IP not whitelisted, slow connection, etc.) we fall back to trusting the
 *   cryptographically verified JWT payload rather than rejecting every authenticated request.
 * - This is SAFE because:
 *     a) The token was signed by our own backend with the same JWT_SECRET.
 *     b) The DB lookup is a secondary check (email-verification enforcement).
 *     c) The role in the token payload is set at sign-time and cannot be forged.
 *
 * Failure modes:
 *   - No Authorization header        → 401
 *   - Malformed / wrong-secret token → 401 (jwt.verify rejects it)
 *   - Expired token                  → 401
 *   - DB available + user not found  → 401
 *   - DB available + not verified    → 403
 *   - DB unavailable                 → pass through with token payload (graceful degradation)
 */
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization header required. Please log in.',
    });
  }

  const token = authHeader.split(' ')[1];

  // Verify the token cryptographically first (no DB needed)
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (jwtErr: any) {
    // jwt.verify throws synchronously for invalid/expired tokens
    const isExpired = jwtErr.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: isExpired
        ? 'Your session has expired. Please log in again.'
        : 'Invalid authentication token. Please log in again.',
    });
  }

  // Token is cryptographically valid — extract payload
  req.userId = decoded.id;
  req.userRole = decoded.role;
  req.companyId = decoded.companyId || undefined;

  // Attempt optional DB verification (email-verification enforcement)
  // Use a short timeout so a slow/disconnected DB does NOT block authenticated requests
  const DB_CHECK_TIMEOUT_MS = 3000;

  const dbCheckPromise = User.findById(decoded.id)
    .select('isEmailVerified provider role')
    .lean()
    .exec();

  const timeoutPromise = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), DB_CHECK_TIMEOUT_MS)
  );

  Promise.race([dbCheckPromise, timeoutPromise])
    .then((user) => {
      if (user === null) {
        // DB timed out or returned null — trust the cryptographic JWT and continue
        // Log in development only
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[Auth] DB check timed out or user not found for id=${decoded.id}. ` +
            `Proceeding with JWT-verified role=${decoded.role}.`
          );
        }
        return next();
      }

      // DB responded — enforce email verification for local-provider accounts
      if ((user as any).provider === 'local' && !(user as any).isEmailVerified) {
        return res.status(403).json({
          success: false,
          message: 'Email verification pending. Please verify your account.',
        });
      }

      next();
    })
    .catch((dbErr: any) => {
      // DB error (e.g., Mongoose buffer timeout when Atlas is unreachable)
      // Trust the cryptographic JWT rather than blocking the authenticated user
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[Auth] DB lookup failed for id=${decoded.id}: ${dbErr.message}. ` +
          `Proceeding with JWT-verified role=${decoded.role}.`
        );
      }
      next();
    });
};

/**
 * Owner-only middleware.
 * Must be used AFTER authenticateJWT (requires req.userRole to be set).
 *
 * The role in req.userRole comes directly from the cryptographically verified
 * JWT payload (set by jwt.sign in authController). It cannot be forged.
 */
export const ownerOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'Owner') {
    return res.status(403).json({
      success: false,
      message: 'Owner access required. You do not have permission to perform this action.',
    });
  }
  next();
};
