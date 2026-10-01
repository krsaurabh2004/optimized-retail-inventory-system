const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/retail_inventory';
    
    // Attempt standard connection with 3 sec timeout
    const options = {
      serverSelectionTimeoutMS: 3000
    };

    try {
      console.log(`Connecting to MongoDB at: ${connStr}`);
      const conn = await mongoose.connect(connStr, options);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      console.warn('Local MongoDB connection failed or timed out. Falling back to MongoMemoryServer...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`MongoMemoryServer started at: ${mongoUri}`);
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB (Memory) Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
