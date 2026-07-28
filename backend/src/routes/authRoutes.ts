import { Router } from 'express';
import { register, login, googleAuth, forgotPassword, resetPassword, sendOTP, verifyOTP } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/google', googleAuth);
router.post('/google-signup', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;

