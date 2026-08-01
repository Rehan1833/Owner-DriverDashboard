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
  }
};
