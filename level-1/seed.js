require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codveda_level1';

const users = [
  { name: 'Alex Johnson',   email: 'alex.johnson@codveda.io',   age: 29, department: 'engineering' },
  { name: 'Maria Garcia',   email: 'maria.garcia@codveda.io',   age: 34, department: 'design'       },
  { name: 'James Williams', email: 'james.williams@codveda.io', age: 27, department: 'marketing'    },
  { name: 'Priya Sharma',   email: 'priya.sharma@codveda.io',   age: 31, department: 'sales'        },
  { name: 'Liam Brown',     email: 'liam.brown@codveda.io',     age: 26, department: 'hr'           },
  { name: 'Sofia Chen',     email: 'sofia.chen@codveda.io',     age: 33, department: 'engineering'  },
  { name: 'Omar Hassan',    email: 'omar.hassan@codveda.io',    age: 28, department: 'design'       },
  { name: 'Emily Davis',    email: 'emily.davis@codveda.io',    age: 25, department: 'marketing'    },
  { name: 'Noah Martinez',  email: 'noah.martinez@codveda.io',  age: 30, department: 'sales'        },
  { name: 'Aisha Okonkwo',  email: 'aisha.okonkwo@codveda.io',  age: 22, department: 'hr'           },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    const created = await User.insertMany(users);
    console.log(`🌱 Seeded ${created.length} users successfully:`);
    created.forEach(u => console.log(`   • ${u.name} (${u.department})`));
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

seed();
