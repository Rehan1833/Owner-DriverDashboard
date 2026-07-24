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
    // No mock default users seeded; new users will register & authenticate via Gmail/Google.
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
