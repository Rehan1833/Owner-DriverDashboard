import { Router } from 'express';
import { register, login, googleAuth, forgotPassword, resetPasswordWithSecurity, sendOTP, verifyOTP, getSecurityQuestion } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/google', googleAuth);
router.post('/google-signup', googleAuth);
router.post('/security-question', getSecurityQuestion);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordWithSecurity);
router.post('/reset-password-security', resetPasswordWithSecurity);

export default router;
