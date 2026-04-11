// Test login functionality
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codveda_level2');
    console.log('Connected to MongoDB\n');

    const email = 'admin@codveda.com';
    const password = 'admin123';

    // Find user with password
    const user = await getUserModel().findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('User found:', user.name);
    console.log('Stored password hash:', user.password.substring(0, 20) + '...');
    console.log('Password field exists:', !!user.password);

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log('\nPassword comparison result:', isMatch);
    
    if (isMatch) {
      console.log('✅ Login would succeed');
    } else {
      console.log('❌ Login would fail - password mismatch');
      
      // Let's try to understand why
      const bcrypt = require('bcryptjs');
      const testHash = await bcrypt.hash(password, 12);
      console.log('\nFresh hash for "admin123":', testHash.substring(0, 20) + '...');
      
      // Force update password
      console.log('\n🔄 Resetting admin password...');
      user.password = password;
      await user.save();
      console.log('✅ Password reset complete. Try logging in now.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testLogin();
