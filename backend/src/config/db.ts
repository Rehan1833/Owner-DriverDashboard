import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const seedDefaultAccounts = async () => {
  try {
    const ownerEmail = 'rehanchaudhari181133@gmail.com';
    const existingOwner = await User.findOne({ email: ownerEmail });
    if (!existingOwner) {
      console.log('Seeding default Owner account...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('123456', salt);
      const owner = new User({
        _id: new mongoose.Types.ObjectId('65f1a2b3c4d5e6f7a8b9c0d1'),
        fullName: 'Rehan Chaudhari',
        email: ownerEmail,
        mobileNumber: '9876543210',
        role: 'Owner',
        passwordHash,
        provider: 'local',
        isEmailVerified: true,
        isPhoneVerified: true,
        verifiedAt: new Date(),
        securityQuestion: "What is your best friend's name?",
        securityAnswerHash: await bcrypt.hash('friend', 10),
        companyName: 'SmartOps Logistics'
      });
      await owner.save();
      console.log('Default Owner account seeded successfully!');
    }

    // Seed Default Driver Account (rajesh@smartops.com)
    const driverEmail = 'rajesh@smartops.com';
    const existingDriver = await User.findOne({ $or: [{ email: driverEmail }, { driverId: 'DRV-9041' }] });
    if (!existingDriver) {
      console.log('Seeding default Driver account (Rajesh Kumar)...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('123456', salt);
      const driver = new User({
        _id: new mongoose.Types.ObjectId('65f1a2b3c4d5e6f7a8b9c0d2'),
        fullName: 'Rajesh Kumar',
        email: driverEmail,
        mobileNumber: '9876543211',
        role: 'Driver',
        driverId: 'DRV-9041',
        vehicleNumber: 'MH-12-QW-9874',
        passwordHash,
        provider: 'local',
        isEmailVerified: true,
        isPhoneVerified: true,
        verifiedAt: new Date(),
        securityQuestion: "What is your best friend's name?",
        securityAnswerHash: await bcrypt.hash('friend', 10),
        companyName: 'SmartOps Logistics'
      });
      await driver.save();
      console.log('Default Driver account seeded successfully!');
    }

    // Seed Second Default Driver Account (driver@smartops.com)
    const driver2Email = 'driver@smartops.com';
    const existingDriver2 = await User.findOne({ $or: [{ email: driver2Email }, { driverId: 'DRV-1001' }] });
    if (!existingDriver2) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('123456', salt);
      const driver2 = new User({
        _id: new mongoose.Types.ObjectId('65f1a2b3c4d5e6f7a8b9c0d3'),
        fullName: 'Vikram Singh',
        email: driver2Email,
        mobileNumber: '9876543212',
        role: 'Driver',
        driverId: 'DRV-1001',
        vehicleNumber: 'MH-14-TR-4421',
        passwordHash,
        provider: 'local',
        isEmailVerified: true,
        isPhoneVerified: true,
        verifiedAt: new Date(),
        securityQuestion: "What is your best friend's name?",
        securityAnswerHash: await bcrypt.hash('friend', 10),
        companyName: 'SmartOps Logistics'
      });
      await driver2.save();
      console.log('Second default Driver account seeded successfully!');
    }
  } catch (err: any) {
    console.error('Error seeding default accounts:', err.message);
  }
};

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/smartops';
    console.log(`Connecting to MongoDB: ${connStr}...`);
    
    // Set connection timeouts so it doesn't hang indefinitely on offline DBs
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    await seedDefaultAccounts();

    // Clean up legacy/stale collection indexes (e.g., username_1)
    try {
      if (mongoose.connection.db) {
        const usersCollection = mongoose.connection.db.collection('users');
        const indexes = await usersCollection.indexes();
        if (indexes.some(idx => idx.name === 'username_1')) {
          await usersCollection.dropIndex('username_1');
          console.log('[DB FIX] Dropped legacy username_1 index from users collection.');
        }
      }
    } catch (indexErr: any) {
      console.log('[DB INDEX SYNC] Legacy index check completed:', indexErr.message);
    }
  } catch (err: any) {
    console.error(`MongoDB connection warning: ${err.message}`);
    console.log('Backend will operate in simulated in-memory state fallback if connection fails.');
    
    try {
      console.log('Starting MongoMemoryServer for simulated in-memory fallback...');
      // @ts-ignore
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`In-memory MongoDB instance started. Connecting Mongoose to: ${mongoUri}...`);
      
      await mongoose.connect(mongoUri);
      console.log('Connected successfully to in-memory MongoDB!');
      await seedDefaultAccounts();
    } catch (fallbackErr: any) {
      console.error(`In-memory database startup failed: ${fallbackErr.message}`);
    }
  }
};
