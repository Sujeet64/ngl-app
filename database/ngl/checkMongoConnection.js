const mongoose = require('mongoose');

// Replace this with your MongoDB URI
const MONGO_URI = 'mongodb+srv://nithishgiri3:SRINIDHI17@ngl.43lot.mongodb.net/ngl?retryWrites=true&w=majority';


async function testConnection() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Successfully connected to MongoDB!');
    mongoose.disconnect(); // Disconnect after the test
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
  }
}

testConnection();
