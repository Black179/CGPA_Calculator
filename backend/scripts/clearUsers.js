const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const clearUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Count users before deletion
    const userCount = await User.countDocuments();
    console.log(`Found ${userCount} users in database`);

    if (userCount === 0) {
      console.log('No users to delete');
      return;
    }

    // Ask for confirmation (in a real script, you'd want better input handling)
    console.log('\n⚠️  WARNING: This will delete ALL users from the database!');
    console.log('This action cannot be undone.');
    console.log('\nTo proceed, you need to modify this script to automatically confirm.');
    console.log('For now, this is a safe script that only shows what would be deleted.');
    console.log('\nIf you want to actually delete users, uncomment the lines below and run again:');

    // Uncomment these lines to actually delete users:
    // const result = await User.deleteMany({});
    // console.log(`Deleted ${result.deletedCount} users`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
clearUsers();
