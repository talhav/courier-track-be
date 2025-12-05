const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abdulahadandotherstuff:<db_password>@mohsinprojet.dlxepla.mongodb.net/?appName=mohsinprojet';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Database connected successfully');
  } catch (error) {
    console.error('✗ Database connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  console.error('✗ Unexpected database error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠ Database disconnected');
});

module.exports = connectDB;
