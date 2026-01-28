import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/asset-management';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');

    const adminEmail = 'admin@example.com';
    const adminPassword = 'password123';
    const adminName = 'Admin User';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email:', adminEmail);
      existingAdmin.password = adminPassword;
      existingAdmin.name = existingAdmin.name || adminName;
      existingAdmin.status = existingAdmin.status || 'ACTIVE';
      existingAdmin.markModified('password'); // ensure pre-save hashes the password
      await existingAdmin.save();
      console.log('Admin password reset to:', adminPassword);
    } else {
      const newAdmin = new User({
        email: adminEmail,
        password: adminPassword,
        role: 'Admin',
        name: adminName,
        status: 'ACTIVE',
      });

      await newAdmin.save();
      console.log('Admin user created successfully');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
