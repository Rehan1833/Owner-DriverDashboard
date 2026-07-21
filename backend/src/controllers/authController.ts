import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { verifyGoogleToken } from '../utils/googleAuth';

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
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        driverId: user.driverId,
        vehicleNumber: user.vehicleNumber
      }
    });
  } catch (err: any) {
    res.status(401).json({ message: err.message || 'Google OAuth authentication failed.' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const googleToken = req.body.idToken || req.body.googleToken || req.body.credential;
    if (googleToken) {
      return googleAuth(req, res);
    }

    const { fullName, email, mobileNumber, role, password, companyName, driverId, vehicleNumber, licenseNumber } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required for local registration.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const normalizedRole = normalizeRole(role);

    const newUser = new User({
      fullName,
      email: email.toLowerCase(),
      mobileNumber: mobileNumber || '',
      role: normalizedRole,
      passwordHash,
      provider: 'local',
      isEmailVerified: false,
      companyName,
      driverId: normalizedRole === 'Driver' ? (driverId || `DRV-${Date.now().toString().slice(-4)}`) : undefined,
      vehicleNumber,
      licenseNumber
    });

    await newUser.save();
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '12h' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        companyName: newUser.companyName,
        driverId: newUser.driverId,
        vehicleNumber: newUser.vehicleNumber
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const googleToken = req.body.idToken || req.body.googleToken || req.body.credential;
    if (googleToken) {
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
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        driverId: user.driverId,
        vehicleNumber: user.vehicleNumber
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPassword = (req: Request, res: Response) => {
  const { email } = req.body;
  res.json({ message: `Reset link dispatched to ${email}. Token simulated.` });
};

export const resetPassword = (req: Request, res: Response) => {
  res.json({ message: 'Password has been successfully updated.' });
};

