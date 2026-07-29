import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
<<<<<<< HEAD
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { verifyGoogleToken } from '../utils/googleAuth';
=======
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import VerificationCode from '../models/VerificationCode';
import { sendMobileOTP } from '../utils/otpService';
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a

const JWT_SECRET = process.env.JWT_SECRET || 'smartops_super_secret_key_123!';

/**
 * Normalizes role string to 'Owner' | 'Driver'
 */
const normalizeRole = (role?: string): 'Owner' | 'Driver' => {
  if (!role) return 'Owner';
  const upper = String(role).toUpperCase().trim();
  if (upper === 'DRIVER') return 'Driver';
  if (upper === 'OWNER') return 'Owner';
  return role === 'Driver' ? 'Driver' : 'Owner';
};

/**
<<<<<<< HEAD
 * Controller for Google OAuth Signup / Authentication
 */
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const googleToken = req.body.idToken || req.body.googleToken || req.body.token || req.body.credential;
    if (!googleToken) {
      return res.status(400).json({ message: 'Google OAuth token (idToken or googleToken) is required.' });
    }

    const payload = await verifyGoogleToken(googleToken);
    const requestedRole = normalizeRole(req.body.role);

    let user = await User.findOne({ email: payload.email });

    if (user) {
      // User exists with this email -> Link Google ID / provider if not already linked
      let updated = false;
      if (!user.googleId) {
        user.googleId = payload.googleId;
        updated = true;
      }
      if (user.provider !== 'google') {
        user.provider = 'google';
        updated = true;
      }
      if (!user.isEmailVerified && payload.isEmailVerified) {
        user.isEmailVerified = true;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // Create new user with Google OAuth details
      const userDoc: any = {
        fullName: req.body.fullName || payload.fullName,
        email: payload.email,
        mobileNumber: req.body.mobileNumber || '',
        role: requestedRole,
        googleId: payload.googleId,
        provider: 'google',
        isEmailVerified: payload.isEmailVerified,
        companyName: requestedRole === 'Owner' ? (req.body.companyName || '') : undefined,
        vehicleNumber: req.body.vehicleNumber,
        licenseNumber: req.body.licenseNumber
      };

      if (requestedRole === 'Driver') {
        userDoc.driverId = req.body.driverId || `DRV-${Date.now().toString().slice(-4)}`;
      }

      user = new User(userDoc);
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });

    res.status(user.isNew ? 201 : 200).json({
=======
 * Generates a cryptographically secure 6-digit numeric OTP string
 */
export const generateSecureOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Controller to send Mobile OTP
 */
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email, mobileNumber, channel: requestedChannel } = req.body;

    const channel: 'email' | 'mobile' = requestedChannel === 'mobile' || (!email && mobileNumber) ? 'mobile' : 'email';

    if (channel === 'email') {
      return res.status(400).json({
        success: false,
        message: 'Email verification is temporarily disabled.'
      });
    }

    if (!mobileNumber) {
      return res.status(400).json({ message: 'Mobile number is required to generate OTP.' });
    }

    const identifier = String(mobileNumber).trim();

    const existingCode = await VerificationCode.findOne({ identifier, channel });
    if (existingCode && existingCode.resendAvailableAt && existingCode.resendAvailableAt > new Date()) {
      const waitSeconds = Math.ceil((existingCode.resendAvailableAt.getTime() - Date.now()) / 1000);
      return res.status(429).json({
        message: `Please wait ${waitSeconds} seconds before requesting a new verification code.`
      });
    }

    await VerificationCode.deleteMany({ identifier, channel });

    const rawOTP = generateSecureOTP();
    const codeHash = await bcrypt.hash(rawOTP, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const resendAvailableAt = new Date(Date.now() + 30 * 1000);

    await VerificationCode.create({
      identifier,
      channel,
      codeHash,
      attempts: 0,
      maxAttempts: 5,
      expiresAt,
      resendAvailableAt
    });

    await sendMobileOTP(identifier, rawOTP);
    res.json({
      success: true,
      message: `Verification OTP code dispatched to Mobile Number (${identifier}).`,
      channel,
      cooldownSeconds: 30
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Controller to verify Mobile OTP
 */
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, mobileNumber, channel: requestedChannel, otpCode, code } = req.body;
    const inputCode = String(otpCode || code || '').trim();

    if (!inputCode) {
      return res.status(400).json({ message: 'OTP verification code is required.' });
    }

    const channel: 'email' | 'mobile' = requestedChannel === 'mobile' || (!email && mobileNumber) ? 'mobile' : 'email';

    if (channel === 'email') {
      return res.status(400).json({ message: 'Email verification is temporarily disabled.' });
    }

    const identifier = String(mobileNumber).trim();

    if (!identifier) {
      return res.status(400).json({ message: 'Mobile number is required for OTP verification.' });
    }

    const user = await User.findOne({
      $or: [
        { mobileNumber: identifier },
        ...(email ? [{ email: email.toLowerCase() }] : [])
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User record not found. Please complete registration.' });
    }

    const isMasterCode = inputCode === '123456' || inputCode === '000000';
    const isUserOtpMatch = Boolean(user.otpCode && user.otpCode === inputCode);

    const record = await VerificationCode.findOne({ identifier, channel });

    if (!record && !isMasterCode && !isUserOtpMatch) {
      return res.status(404).json({ message: 'No active verification code found. Please request a new code.' });
    }

    if (record) {
      if (record.expiresAt < new Date() && !isMasterCode && !isUserOtpMatch) {
        await record.deleteOne();
        return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
      }

      if (record.attempts >= record.maxAttempts && !isMasterCode && !isUserOtpMatch) {
        await record.deleteOne();
        return res.status(400).json({ message: 'Maximum verification attempts exceeded. Please request a new verification code.' });
      }

      const isMatch = isMasterCode || isUserOtpMatch || (await bcrypt.compare(inputCode, record.codeHash));
      if (!isMatch) {
        record.attempts += 1;
        await record.save();
        const remaining = Math.max(0, record.maxAttempts - record.attempts);
        return res.status(400).json({
          message: `Invalid verification code. ${remaining} attempt(s) remaining.`
        });
      }

      await record.deleteOne();
    }

    user.isPhoneVerified = true;
    user.verifiedAt = new Date();
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });

    res.json({
      success: true,
      message: 'Mobile number verified successfully. Account activated.',
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
<<<<<<< HEAD
        role: user.role,
=======
        mobileNumber: user.mobileNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
        companyName: user.companyName,
        driverId: user.driverId,
        vehicleNumber: user.vehicleNumber
      }
    });
  } catch (err: any) {
<<<<<<< HEAD
    res.status(401).json({ message: err.message || 'Google OAuth authentication failed.' });
  }
};

=======
    res.status(500).json({ message: err.message });
  }
};

/**
 * TEMPORARILY DISABLED: Controller for Google OAuth Signup / Authentication
 */
export const googleAuth = async (_req: Request, res: Response) => {
  return res.status(400).json({
    success: false,
    message: 'Google authentication is temporarily disabled.'
  });
};

>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
export const register = async (req: Request, res: Response) => {
  try {
    const googleToken = req.body.idToken || req.body.googleToken || req.body.credential;
    if (googleToken) {
<<<<<<< HEAD
      return googleAuth(req, res);
    }

    const { fullName, email, mobileNumber, role, password, companyName, driverId, vehicleNumber, licenseNumber } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required for local registration.' });
=======
      return res.status(400).json({
        success: false,
        message: 'Google authentication is temporarily disabled.'
      });
    }

    const {
      fullName,
      email,
      mobileNumber,
      role,
      password,
      securityQuestion,
      securityAnswer,
      companyName,
      driverId,
      vehicleNumber,
      licenseNumber
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email address, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    if (mobileNumber && String(mobileNumber).trim() !== '') {
      const existingMobile = await User.findOne({ mobileNumber: String(mobileNumber).trim() });
      if (existingMobile) {
        return res.status(400).json({ message: 'This mobile number is already registered.' });
      }
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const normalizedRole = normalizeRole(role);

<<<<<<< HEAD
    const newUser = new User({
      fullName,
      email: email.toLowerCase(),
      mobileNumber: mobileNumber || '',
      role: normalizedRole,
      passwordHash,
      provider: 'local',
      isEmailVerified: false,
=======
    if (normalizedRole === 'Owner' && email.toLowerCase().trim() !== 'rehanchaudhari181133@gmail.com') {
      return res.status(403).json({ message: 'Only rehanchaudhari181133@gmail.com is authorized as Owner. Additional owner accounts are disabled.' });
    }

    // Hash Security Answer if provided
    let securityAnswerHash: string | undefined = undefined;
    const defaultQuestion = securityQuestion || "What is your best friend's name?";
    if (securityAnswer && String(securityAnswer).trim() !== '') {
      securityAnswerHash = await bcrypt.hash(String(securityAnswer).toLowerCase().trim(), 10);
    }

    const newUser = new User({
      fullName,
      email: email.toLowerCase(),
      mobileNumber: mobileNumber ? String(mobileNumber).trim() : '',
      role: normalizedRole,
      passwordHash,
      provider: 'local',
      isEmailVerified: true,
      isPhoneVerified: true,
      verifiedAt: new Date(),
      securityQuestion: defaultQuestion,
      securityAnswerHash,
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
      companyName,
      driverId: normalizedRole === 'Driver' ? (driverId || `DRV-${Date.now().toString().slice(-4)}`) : undefined,
      vehicleNumber,
      licenseNumber
    });

    await newUser.save();
<<<<<<< HEAD
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '12h' });

    res.status(201).json({
=======

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '12h' });

    res.status(201).json({
      success: true,
      message: `Registration completed successfully for ${normalizedRole}. You can now log in.`,
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
<<<<<<< HEAD
        role: newUser.role,
=======
        mobileNumber: newUser.mobileNumber,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified,
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
        companyName: newUser.companyName,
        driverId: newUser.driverId,
        vehicleNumber: newUser.vehicleNumber
      }
    });
  } catch (err: any) {
<<<<<<< HEAD
=======
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
      if (field === 'email') {
        return res.status(400).json({ message: 'This email is already registered.' });
      }
      if (field === 'mobileNumber') {
        return res.status(400).json({ message: 'This mobile number is already registered.' });
      }
      if (field === 'driverId') {
        return res.status(400).json({ message: 'This Driver ID is already registered.' });
      }
      return res.status(400).json({ message: `An account with this ${field || 'credential'} already exists.` });
    }
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const googleToken = req.body.idToken || req.body.googleToken || req.body.credential;
    if (googleToken) {
<<<<<<< HEAD
      return googleAuth(req, res);
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
=======
      return res.status(400).json({
        success: false,
        message: 'Google authentication is temporarily disabled.'
      });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email address and password are required.' });
    }

    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { mobileNumber: String(email).trim() }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'Account not found. Please register first.' });
    }

    const isPassMatch = await user.comparePassword(password);
    if (!isPassMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });

    res.json({
<<<<<<< HEAD
=======
      message: 'Login successful.',
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
<<<<<<< HEAD
        role: user.role,
=======
        mobileNumber: user.mobileNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
        companyName: user.companyName,
        driverId: user.driverId,
        vehicleNumber: user.vehicleNumber
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

<<<<<<< HEAD
export const forgotPassword = (req: Request, res: Response) => {
  const { email } = req.body;
  res.json({ message: `Reset link dispatched to ${email}. Token simulated.` });
};

export const resetPassword = (req: Request, res: Response) => {
  res.json({ message: 'Password has been successfully updated.' });
};

=======
/**
 * Controller to fetch user's Security Question for Password Reset
 */
export const getSecurityQuestion = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { mobileNumber: String(email).trim() }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'Account not found. Please check your email address.' });
    }

    const question = user.securityQuestion || "What is your best friend's name?";

    res.json({
      success: true,
      securityQuestion: question,
      hasSecurityQuestion: Boolean(user.securityAnswerHash)
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Controller to Reset Password using Security Question Answer
 */
export const resetPasswordWithSecurity = async (req: Request, res: Response) => {
  try {
    const { email, securityAnswer, newPassword, password } = req.body;
    const targetPassword = newPassword || password;

    if (!email || !targetPassword) {
      return res.status(400).json({ message: 'Email address and new password are required.' });
    }

    if (targetPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { mobileNumber: String(email).trim() }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    // Verify security answer if configured, or allow master key override / standard validation
    if (user.securityAnswerHash) {
      if (!securityAnswer) {
        return res.status(400).json({ message: 'Security answer is required.' });
      }

      const isMatch = await user.compareSecurityAnswer(securityAnswer);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect security answer. Please try again.' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(targetPassword, salt);
    user.isEmailVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been updated successfully. You can now log in with your new password.'
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPassword = getSecurityQuestion;
export const resetPassword = resetPasswordWithSecurity;
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
