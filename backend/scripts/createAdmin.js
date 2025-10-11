const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createInitialAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [
        { email: 'admin@cgpacalc.com' },
        { role: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create initial admin user
    const adminUser = new User({
      registerNumber: 'ADMIN001',
      username: 'Super Admin',
      email: 'admin@cgpacalc.com',
      password: 'Admin@123456', // You should change this password
      role: 'admin',
      batch: 'ADMIN'
    });

    await adminUser.save();
    console.log('Initial admin user created successfully!');
    console.log('Email: admin@cgpacalc.com');
    console.log('Password: Admin@123456');
    console.log('IMPORTANT: Please change the default password after first login!');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
createInitialAdmin();
