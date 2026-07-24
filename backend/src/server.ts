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

// Database Seeding Logic
const seedMockDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty. Seeding initial owner and driver credentials...');
      
      const salt = await bcrypt.genSalt(10);
      const ownerHash = await bcrypt.hash('password123', salt);
      const driverHash = await bcrypt.hash('password123', salt);

      const defaultOwner = new User({
        fullName: 'Harsh Vardhan',
        email: 'harsh.v@smartops.com',
        mobileNumber: '9876543210',
        role: 'Owner',
        passwordHash: ownerHash,
        companyName: 'SmartOps Manufacturing Ltd.'
      });

      const defaultDriver = new User({
        fullName: 'Rajesh Kumar',
        email: 'rajesh.k@smartops.com',
        mobileNumber: '9123456789',
        role: 'Driver',
        passwordHash: driverHash,
        driverId: 'DRV-9041',
        vehicleNumber: 'MH-12-QW-9874',
        licenseNumber: 'DL-MH12-9988'
      });

      await defaultOwner.save();
      await defaultDriver.save();
      console.log('Database empty. Preserved initial owner and driver credentials.');

      console.log('Database seeding successfully completed.');
    }
  } catch (err: any) {
    console.error('Database seeding failed:', err.message);
  }
};

// Bootstrap Server
connectDB().then(() => {
  seedMockDatabase();
  server.listen(PORT, () => {
    console.log(`SmartOps Express Server listening on port ${PORT}`);
  });
});
