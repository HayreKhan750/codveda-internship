// Fix admin password
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codveda_level2');
    console.log('Connected to MongoDB\n');

    const email = 'admin@codveda.com';
    const password = 'admin123';

    // Find admin
    const user = await getUserModel().findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ Admin not found, creating...');
      await getUserModel().create({
        name: 'Admin User',
        email: 'admin@codveda.com',
        password: password,
        age: 30,
        department: 'engineering',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin created');
    } else {
      console.log('Found admin:', user.name);
      console.log('Resetting password...');
      
      // Update password - this will trigger the pre-save hash
      user.password = password;
      await user.save();
      console.log('✅ Password reset complete');
    }

    // Verify it works
    const verifyUser = await getUserModel().findOne({ email: email.toLowerCase() }).select('+password');
    const isMatch = await verifygetUserModel().comparePassword(password);
    console.log('\nPassword verification:', isMatch ? '✅ SUCCESS' : '❌ FAILED');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixAdmin();
