const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected to database: ${conn.connection.db.databaseName}`);
    console.log(`MongoDB Host: ${conn.connection.host}`);
    
    const doctorCount = await conn.models.Doctor?.countDocuments() || 0;
    console.log(`Number of doctors in database: ${doctorCount}`);
    
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Full error:', error);
    process.exit(1); 
  }
};

module.exports = connectDB; 