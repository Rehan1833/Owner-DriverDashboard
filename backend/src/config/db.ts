import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/smartops';
    console.log(`Connecting to MongoDB: ${connStr}...`);
    
    // Set connection timeouts so it doesn't hang indefinitely on offline DBs
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (err: any) {
    console.error(`MongoDB connection warning: ${err.message}`);
    console.log('Backend will operate in simulated in-memory state fallback if connection fails.');
  }
};
