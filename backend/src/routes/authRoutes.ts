import { Router } from 'express';
import { register, login, googleAuth, forgotPassword, resetPasswordWithSecurity, sendOTP, verifyOTP, getSecurityQuestion } from '../controllers/authController';
import { globalAuthLimiter, loginLimiter, otpLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply global rate limiting across all auth endpoints (/api/auth/*)
router.use(globalAuthLimiter);

// Auth endpoints with specific rate limiters
router.post('/login', loginLimiter, login);
router.post('/send-otp', otpLimiter, sendOTP);
router.post('/verify-otp', otpLimiter, verifyOTP);

// Other auth endpoints
router.post('/register', register);
router.post('/google', googleAuth);
router.post('/google-signup', googleAuth);
router.post('/security-question', getSecurityQuestion);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordWithSecurity);
router.post('/reset-password-security', resetPasswordWithSecurity);

export default router;
