const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  fullName: String,
  phone: String,
  role: String,
  isActive: Boolean,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@couriertrack.com' });
    if (existingAdmin) {
      console.log('⚠ Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = new User({
      email: 'admin@couriertrack.com',
      passwordHash,
      fullName: 'System Admin',
      role: 'admin',
      isActive: true,
    });

    await admin.save();
    console.log('✓ Admin user created successfully');
    console.log('\nDefault Login Credentials:');
    console.log('  Email: admin@couriertrack.com');
    console.log('  Password: admin123');
    console.log('\n⚠️  Remember to change the default password!\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Seed failed:', error);
    process.exit(1);
  }
}

seed();
