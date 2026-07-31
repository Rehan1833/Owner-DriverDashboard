import { Router } from 'express';
import { getDrivers, updateDriverStatus } from '../controllers/driverController';
import { updateProfile } from '../controllers/userController';
import { authenticateJWT, ownerOnly } from '../middleware/authMiddleware';

const router = Router();

// Require authentication for all routes
router.use(authenticateJWT);

// Authenticated user profile routes
router.put('/profile', updateProfile);

// Owner-only routes
router.use(ownerOnly);

/**
 * GET /api/users/drivers
 * Returns all registered Driver accounts from MongoDB.
 * Supports: ?search=&status=Active|Inactive|All&page=1&limit=20
 */
router.get('/drivers', getDrivers);

/**
 * PATCH /api/users/drivers/:id/status
 * Soft deactivate or reactivate a driver.
 * Body: { status: 'active' | 'inactive' }
 */
router.patch('/drivers/:id/status', updateDriverStatus);

export default router;
