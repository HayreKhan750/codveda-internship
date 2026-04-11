require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codveda_level2';

const users = [
  { name: 'Admin User',     email: 'admin@codveda.io',      password: 'Admin@123',  age: 35, department: 'engineering', role: 'admin' },
  { name: 'Alex Johnson',   email: 'alex@codveda.io',       password: 'Pass@1234',  age: 29, department: 'engineering' },
  { name: 'Maria Garcia',   email: 'maria@codveda.io',      password: 'Pass@1234',  age: 34, department: 'design' },
  { name: 'James Williams', email: 'james@codveda.io',      password: 'Pass@1234',  age: 27, department: 'marketing' },
  { name: 'Priya Sharma',   email: 'priya@codveda.io',      password: 'Pass@1234',  age: 31, department: 'sales' },
  { name: 'Liam Brown',     email: 'liam@codveda.io',       password: 'Pass@1234',  age: 26, department: 'hr' },
  { name: 'Sofia Chen',     email: 'sofia@codveda.io',      password: 'Pass@1234',  age: 33, department: 'engineering' },
  { name: 'Omar Hassan',    email: 'omar@codveda.io',       password: 'Pass@1234',  age: 28, department: 'design' },
  { name: 'Emily Davis',    email: 'emily@codveda.io',      password: 'Pass@1234',  age: 25, department: 'marketing' },
  { name: 'Noah Martinez',  email: 'noah@codveda.io',       password: 'Pass@1234',  age: 30, department: 'sales' },
  { name: 'Aisha Okonkwo',  email: 'aisha@codveda.io',      password: 'Pass@1234',  age: 22, department: 'hr' },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');

    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    for (const u of users) {
      await User.create(u); // triggers bcrypt pre-save hook
    }
    console.log(`🌱 Seeded ${users.length} users:`);
    users.forEach(u => console.log(`   • ${u.name} <${u.email}> [${u.role || 'user'}]`));
    console.log('\n🔑 Login credentials:');
    console.log('   Admin: admin@codveda.io / Admin@123');
    console.log('   User:  alex@codveda.io  / Pass@1234');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
