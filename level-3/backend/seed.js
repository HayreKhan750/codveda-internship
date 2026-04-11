const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codveda_level3');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create sample users (passwords will be hashed by the User model pre-save hook)
    const users = [
      {
        name: 'Admin User',
        email: 'admin@codveda.com',
        password: 'admin123',
        age: 30,
        department: 'engineering',
        role: 'admin'
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        age: 28,
        department: 'engineering',
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        age: 25,
        department: 'design',
        role: 'user'
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'password123',
        age: 32,
        department: 'marketing',
        role: 'user'
      },
      {
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        password: 'password123',
        age: 27,
        department: 'sales',
        role: 'user'
      }
    ];

    // Create users individually to trigger pre-save hooks
    for (const userData of users) {
      await User.create(userData);
    }
    console.log('Sample users created successfully');
    console.log('\nDefault credentials:');
    console.log('Admin: admin@codveda.com / admin123');
    console.log('Users: [email] / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
