import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'smartops_super_secret_key_123!';

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, mobileNumber, role, password, companyName, driverId, vehicleNumber, licenseNumber } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      mobileNumber,
      role,
      passwordHash,
      companyName,
      driverId,
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
    const { email, password } = req.body;
    const user = await User.findOne({ email });
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
