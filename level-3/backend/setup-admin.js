// Quick setup script to ensure admin user exists
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const setupAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codveda_level2');
    console.log('Connected to MongoDB');

    // Check if admin exists
    let admin = await User.findOne({ email: 'admin@codveda.com' });
    
    if (!admin) {
      console.log('Creating admin user...');
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@codveda.com',
        password: 'admin123',
        age: 30,
        department: 'engineering',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin user created: admin@codveda.com / admin123');
    } else {
      console.log('Admin user already exists');
    }

    // Create sample users if less than 3 users exist
    const userCount = await User.countDocuments({ isActive: true });
    if (userCount < 3) {
      console.log('Creating sample users...');
      
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        age: 28,
        department: 'engineering',
        role: 'user'
      });
      
      await User.create({
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        age: 25,
        department: 'design',
        role: 'user'
      });
      
      console.log('✅ Sample users created');
    }

    console.log('\nLogin credentials:');
    console.log('Admin: admin@codveda.com / admin123');
    console.log('Users: john@example.com / password123');
    console.log('       jane@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Setup error:', error);
    process.exit(1);
  }
};

setupAdmin();
