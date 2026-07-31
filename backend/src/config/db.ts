import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const seedDefaultOwner = async () => {
  try {
    const ownerEmail = 'rehanchaudhari181133@gmail.com';
    const existing = await User.findOne({ email: ownerEmail });
    if (!existing) {
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
  } catch (err: any) {
    console.error('Error seeding default Owner:', err.message);
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
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`In-memory MongoDB instance started. Connecting Mongoose to: ${mongoUri}...`);
      
      const conn = await mongoose.connect(mongoUri);
      console.log('Connected successfully to in-memory MongoDB!');
      
      await seedDefaultOwner();
    } catch (fallbackErr: any) {
      console.error(`In-memory database startup failed: ${fallbackErr.message}`);
    }
  }
};
