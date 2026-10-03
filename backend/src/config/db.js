const mongoose = require('mongoose');
const { seedInitialData } = require('./embeddedStore');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tihs_cems';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`[TIHS-CEMS] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    isConnected = false;
    // Disable command buffering on Mongoose so operations do not hang or time out!
    mongoose.set('bufferCommands', false);

    console.warn(`[TIHS-CEMS] Local MongoDB (127.0.0.1:27017) not reachable: ${error.message}`);
    console.log('[TIHS-CEMS] Activated Embedded High-Performance Data Store fallback.');
    console.log('[TIHS-CEMS] Ready to serve all API requests with zero latency & pre-seeded demo accounts.');

    // Seed embedded store with the 4 demo users and 5 events
    await seedInitialData();
  }
};

const isMongoConnected = () => isConnected;

module.exports = connectDB;
module.exports.isMongoConnected = isMongoConnected;
