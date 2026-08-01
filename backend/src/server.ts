import http from 'http';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import app from './app';
import { connectDB } from './config/db';
import { initSocket } from './sockets/telemetrySocket';

// Mongoose Models for Seeding
import User from './models/User';
import Inventory from './models/Inventory';
import Attendance from './models/Attendance';
import Salary from './models/Salary';
import Vehicle from './models/Vehicle';
import Trip from './models/Trip';

// Load Configurations
dotenv.config();

const PORT = process.env.PORT || 5000;

// Create http server wrapper
const server = http.createServer(app);

// Initialize Socket.io telemetry handlers
initSocket(server);

// Database Seeding & Single Owner Enforcement Logic
const seedMockDatabase = async () => {
  try {
    const TARGET_OWNER_EMAIL = 'rehanchaudhari181133@gmail.com';

    // 1. Delete all other owner accounts except the designated target owner
    const deletedOwners = await User.deleteMany({
      role: 'Owner',
      email: { $ne: TARGET_OWNER_EMAIL }
    });
    if (deletedOwners.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedOwners.deletedCount} non-primary owner account(s).`);
    }

    // 2. Ensure single owner account exists in MongoDB
    const ownerExists = await User.findOne({ email: TARGET_OWNER_EMAIL });
    if (!ownerExists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Password@123', salt);
      await User.create({
        fullName: 'Rehan Chaudhari',
        email: TARGET_OWNER_EMAIL,
        mobileNumber: '9999999999',
        role: 'Owner',
        passwordHash,
        provider: 'local',
        isEmailVerified: true,
        isPhoneVerified: true,
        verifiedAt: new Date(),
        companyName: 'SmartOps Manufacturing'
      });
      console.log(`✅ Single Owner account (${TARGET_OWNER_EMAIL}) initialized successfully.`);
    }

    // 3. Clean mock data from database
    await Vehicle.deleteMany({});
    await Inventory.deleteMany({});
    await Trip.deleteMany({});
    await Salary.deleteMany({});
    await Attendance.deleteMany({});
    console.log('✅ Cleaned all mock data (Vehicles, Inventory, Trips, Salaries, Attendance) from MongoDB.');

  } catch (err: any) {
    console.error('Database single owner enforcement warning:', err.message);
  }
};

import { validateEmailEnvironment } from './utils/otpService';

// Bootstrap Server
connectDB().then(() => {
  seedMockDatabase();
  validateEmailEnvironment();
  server.listen(PORT, () => {
    console.log(`SmartOps Express Server listening on port ${PORT}`);
  });
});

