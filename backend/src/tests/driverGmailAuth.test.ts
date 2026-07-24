import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes';
import User from '../models/User';
import * as otpService from '../utils/otpService';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

jest.mock('../models/User');
jest.mock('../utils/otpService');

describe('Driver Gmail Authentication & Code Verification API', () => {
  beforeEach(() => {
    (otpService.generateOTP as jest.Mock).mockReturnValue('654321');
    (otpService.sendGmailCode as jest.Mock).mockResolvedValue(true);
    (otpService.sendMobileOTP as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register (Driver Gmail Registration)', () => {
    it('should generate Gmail OTP code and send to Driver upon registration', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const mockDriver = {
        _id: 'driver-id-101',
        fullName: 'Ramesh Sharma',
        email: 'ramesh.driver@gmail.com',
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
      expect(res.body.message).toContain('Registration initiated for Driver');
      expect(res.body.user).toHaveProperty('email', 'ramesh.driver@gmail.com');
      expect(res.body.user).toHaveProperty('isEmailVerified', false);
      expect(otpService.sendGmailCode).toHaveBeenCalledWith('ramesh.driver@gmail.com', expect.any(String), 'Driver');
    });
  });

  describe('POST /api/auth/login (Driver Gmail Code Authentication)', () => {
    it('should authenticate Driver using the Gmail OTP code entered as password', async () => {
      const mockUnverifiedDriver = {
        _id: 'driver-id-101',
        fullName: 'Ramesh Sharma',
        email: 'ramesh.driver@gmail.com',
        role: 'Driver',
        driverId: 'DRV-1010',
        vehicleNumber: 'MH-14-AB-9988',
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
      expect(mockUnverifiedDriver.otpCode).toBeUndefined();
      expect(mockUnverifiedDriver.save).toHaveBeenCalled();
    });

    it('should return 403 with Gmail prompt if Driver logs in with password before verifying Gmail code', async () => {
      const mockUnverifiedDriver = {
        _id: 'driver-id-101',
        fullName: 'Ramesh Sharma',
        email: 'ramesh.driver@gmail.com',
        role: 'Driver',
        driverId: 'DRV-1010',
        isEmailVerified: false,
        otpCode: '654321',
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUnverifiedDriver);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ramesh.driver@gmail.com',
          password: 'securepassword123'
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Account email verification pending');
    });
  });

  describe('POST /api/auth/verify-otp (Verify Driver Gmail OTP)', () => {
    it('should mark Driver as email verified when valid Gmail OTP code is posted', async () => {
      const mockDriver = {
        _id: 'driver-id-101',
        fullName: 'Ramesh Sharma',
        email: 'ramesh.driver@gmail.com',
        role: 'Driver',
        driverId: 'DRV-1010',
        isEmailVerified: false,
        otpCode: '654321',
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockDriver);

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'ramesh.driver@gmail.com',
          otpCode: '654321'
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('OTP authentication successful');
      expect(mockDriver.isEmailVerified).toBe(true);
      expect(mockDriver.save).toHaveBeenCalled();
    });
  });
});
