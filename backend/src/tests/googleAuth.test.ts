import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes';
import * as googleAuthUtil from '../utils/googleAuth';
import User from '../models/User';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

jest.mock('../models/User');
jest.mock('../utils/googleAuth');

describe('Google OAuth Backend Authentication API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/google', () => {
    it('should return 400 if googleToken is missing', async () => {
      const res = await request(app)
        .post('/api/auth/google')
        .send({ role: 'Driver' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Google OAuth token');
    });

    it('should create a new Driver user via Google OAuth and return token', async () => {
      const mockPayload = {
        googleId: 'google-uid-12345',
        email: 'testdriver@gmail.com',
        isEmailVerified: true,
        fullName: 'Test Driver',
      };

      (googleAuthUtil.verifyGoogleToken as jest.Mock).mockResolvedValue(mockPayload);
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const mockSavedUser = {
        _id: 'user-id-999',
        fullName: 'Test Driver',
        email: 'testdriver@gmail.com',
        role: 'Driver',
        driverId: 'DRV-9999',
        isNew: true,
        save: jest.fn().mockResolvedValue(true)
      };

      (User as unknown as jest.Mock).mockImplementation(function() {
        return mockSavedUser;
      });

      const res = await request(app)
        .post('/api/auth/google')
        .send({
          idToken: 'mock-valid-google-id-token',
          role: 'DRIVER',
          vehicleNumber: 'MH-12-AB-1234'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toEqual({
        id: 'user-id-999',
        fullName: 'Test Driver',
        email: 'testdriver@gmail.com',
        role: 'Driver',
        companyName: undefined,
        driverId: 'DRV-9999',
        vehicleNumber: undefined
      });
    });

    it('should link provider and login existing Owner account', async () => {
      const mockPayload = {
        googleId: 'google-uid-67890',
        email: 'existingowner@gmail.com',
        isEmailVerified: true,
        fullName: 'Existing Owner',
      };

      (googleAuthUtil.verifyGoogleToken as jest.Mock).mockResolvedValue(mockPayload);

      const mockExistingUser = {
        _id: 'user-owner-100',
        fullName: 'Existing Owner',
        email: 'existingowner@gmail.com',
        role: 'Owner',
        companyName: 'Acme Fleet Corp',
        googleId: undefined,
        provider: 'local',
        isEmailVerified: false,
        isNew: false,
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockExistingUser);

      const res = await request(app)
        .post('/api/auth/google')
        .send({
          googleToken: 'mock-existing-owner-token',
          role: 'OWNER'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(mockExistingUser.googleId).toBe('google-uid-67890');
      expect(mockExistingUser.provider).toBe('google');
      expect(mockExistingUser.isEmailVerified).toBe(true);
      expect(mockExistingUser.save).toHaveBeenCalled();
    });

    it('should return 401 if Google OAuth token verification fails', async () => {
      (googleAuthUtil.verifyGoogleToken as jest.Mock).mockRejectedValue(new Error('Invalid token signature'));

      const res = await request(app)
        .post('/api/auth/google')
        .send({ idToken: 'invalid-token' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid token signature');
    });
  });

  describe('POST /api/auth/register with Google Token', () => {
    it('should handle Google signup seamlessly through standard register endpoint', async () => {
      const mockPayload = {
        googleId: 'google-uid-555',
        email: 'seamlessdriver@gmail.com',
        isEmailVerified: true,
        fullName: 'Seamless Driver',
      };

      (googleAuthUtil.verifyGoogleToken as jest.Mock).mockResolvedValue(mockPayload);
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const mockSavedUser = {
        _id: 'user-id-555',
        fullName: 'Seamless Driver',
        email: 'seamlessdriver@gmail.com',
        role: 'Driver',
        driverId: 'DRV-5555',
        isNew: true,
        save: jest.fn().mockResolvedValue(true)
      };

      (User as unknown as jest.Mock).mockImplementation(function() {
        return mockSavedUser;
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          idToken: 'mock-google-token',
          role: 'DRIVER'
        });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('seamlessdriver@gmail.com');
      expect(res.body.user.role).toBe('Driver');
    });
  });
});
