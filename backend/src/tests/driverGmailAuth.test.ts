import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes';
import User from '../models/User';
import * as otpService from '../utils/otpService';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

jest.mock('../models/User');
jest.mock('../models/VerificationCode');
jest.mock('../utils/otpService');

describe('Secure Driver & Owner Authentication & OTP Verification API', () => {
  beforeEach(() => {
    (otpService.generateOTP as jest.Mock).mockReturnValue('654321');
    (otpService.sendGmailCode as jest.Mock).mockResolvedValue(true);
    (otpService.sendMobileOTP as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should generate Gmail OTP code and return 201 for new user registration', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const mockDriver = {
        _id: 'driver-id-101',
        fullName: 'Ramesh Sharma',
        email: 'ramesh.driver@gmail.com',
        mobileNumber: '9876500000',
        role: 'Driver',
        driverId: 'DRV-1010',
        vehicleNumber: 'MH-14-AB-9988',
        licenseNumber: 'DL-MH14-2026',
        isEmailVerified: false,
        otpCode: '654321',
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        save: jest.fn().mockResolvedValue(true)
      };

      (User as unknown as jest.Mock).mockImplementation(function() {
        return mockDriver;
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Ramesh Sharma',
          email: 'ramesh.driver@gmail.com',
          mobileNumber: '9876500000',
          role: 'Driver',
          password: 'securepassword123',
          vehicleNumber: 'MH-14-AB-9988',
          licenseNumber: 'DL-MH14-2026'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('otpCode');
      expect(res.body.message).toMatch(/OTP sent successfully|Registration initiated/);
      expect(res.body.user).toHaveProperty('email', 'ramesh.driver@gmail.com');
      expect(res.body.user).toHaveProperty('isEmailVerified', false);
      expect(otpService.sendGmailCode).toHaveBeenCalledWith('ramesh.driver@gmail.com', expect.any(String), 'Driver');
    });

    it('should reject registration if email already exists', async () => {
      (User.findOne as jest.Mock).mockImplementation(async (query: any) => {
        if (query.email === 'duplicate@gmail.com') return { email: 'duplicate@gmail.com' };
        return null;
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Duplicate User',
          email: 'duplicate@gmail.com',
          mobileNumber: '9876543210',
          role: 'Owner',
          password: 'securepassword123'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('This email is already registered.');
    });

    it('should reject registration if mobile number already exists', async () => {
      (User.findOne as jest.Mock).mockImplementation(async (query: any) => {
        if (query.mobileNumber === '9999988888') return { mobileNumber: '9999988888' };
        return null;
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Mobile User',
          email: 'unique@gmail.com',
          mobileNumber: '9999988888',
          role: 'Owner',
          password: 'securepassword123'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('This mobile number is already registered.');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 404 if user account does not exist', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@gmail.com',
          password: 'password123'
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Account not found. Please register first.');
    });

    it('should return 403 if user account is not email verified', async () => {
      const mockUnverifiedUser = {
        _id: 'user-101',
        email: 'unverified@gmail.com',
        role: 'Driver',
        isEmailVerified: false,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUnverifiedUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unverified@gmail.com',
          password: 'securepassword123'
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Please verify your email first');
    });

    it('should allow login with valid Gmail OTP code as password and verify account', async () => {
      const mockUnverifiedDriver = {
        _id: 'driver-id-101',
        fullName: 'Ramesh Sharma',
        email: 'ramesh.driver@gmail.com',
        role: 'Driver',
        driverId: 'DRV-1010',
        isEmailVerified: false,
        otpCode: '654321',
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        comparePassword: jest.fn().mockResolvedValue(false),
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUnverifiedDriver);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ramesh.driver@gmail.com',
          password: '654321'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(mockUnverifiedDriver.isEmailVerified).toBe(true);
    });

    it('should authenticate verified user with correct password', async () => {
      const mockVerifiedUser = {
        _id: 'user-202',
        fullName: 'Verified Owner',
        email: 'owner@smartops.com',
        role: 'Owner',
        isEmailVerified: true,
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockVerifiedUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'owner@smartops.com',
          password: 'correctpassword123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.isEmailVerified).toBe(true);
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    it('should mark account verified when valid OTP code is posted', async () => {
      const mockUser = {
        _id: 'user-101',
        email: 'ramesh.driver@gmail.com',
        role: 'Driver',
        isEmailVerified: false,
        otpCode: '654321',
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'ramesh.driver@gmail.com',
          otpCode: '654321'
        });

      expect(res.status).toBe(200);
      expect(mockUser.isEmailVerified).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });
});
