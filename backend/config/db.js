const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopkart";
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.log(`[MongoDB] Could not connect to local instance (${error.message}). Attempting In-Memory MongoDB fallback...`);
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`[MongoDB] Connected to In-Memory Database: ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`[MongoDB] Error initializing database: ${fallbackError.message}`);
      console.error("[MongoDB] Please ensure MongoDB service is started or MONGO_URI is set in .env");
    }
  }
};

module.exports = connectDB;
