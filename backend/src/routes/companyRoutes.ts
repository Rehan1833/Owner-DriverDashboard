import { Router } from 'express';
import { checkCompanyName, getMyCompany } from '../controllers/companyController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// Public — real-time duplicate name check (used during registration form)
router.get('/check', checkCompanyName);

// Protected — get the company linked to the authenticated user
router.get('/me', authenticateJWT, getMyCompany);

export default router;
