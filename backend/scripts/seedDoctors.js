const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const path = require('path');
const connectDB = require('../config/db');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('Current directory:', __dirname);
console.log('MONGODB_URI:', process.env.MONGODB_URI); // Log the MongoDB URI

const doctors = [
  {
    name: "Dr. John Smith",
    workingHours: {
      start: "09:00",
      end: "17:00"
    },
    specialization: "General Medicine"
  },
  {
    name: "Dr. Sarah Johnson",
    workingHours: {
      start: "08:00",
      end: "16:00"
    },
    specialization: "Pediatrics"
  },
  {
    name: "Dr. Michael Chen",
    workingHours: {
      start: "10:00",
      end: "18:00"
    },
    specialization: "Cardiology"
  },
  {
    name: "Dr. Emily Brown",
    workingHours: {
      start: "09:30",
      end: "17:30"
    },
    specialization: "Dermatology"
  }
];

async function seedDoctors() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log('Cleared existing doctors');

    // Insert new doctors
    const result = await Doctor.insertMany(doctors);
    console.log('Added doctors:', result);

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding doctors:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDoctors();