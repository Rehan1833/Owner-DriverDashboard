import { Router } from 'express';
<<<<<<< HEAD
import { register, login, googleAuth, forgotPassword, resetPassword } from '../controllers/authController';
=======
import { register, login, googleAuth, forgotPassword, resetPasswordWithSecurity, sendOTP, verifyOTP, getSecurityQuestion } from '../controllers/authController';
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a

const router = Router();

router.post('/register', register);
router.post('/login', login);
<<<<<<< HEAD
router.post('/google', googleAuth);
router.post('/google-signup', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;

=======
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/google', googleAuth);
router.post('/google-signup', googleAuth);
router.post('/security-question', getSecurityQuestion);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordWithSecurity);
router.post('/reset-password-security', resetPasswordWithSecurity);

export default router;
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
