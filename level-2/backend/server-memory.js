// DEMO MODE: In-memory storage (no MongoDB required)
// For production, use MongoDB version (server.js)

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key';

// In-memory storage
let users = [
  {
    _id: '1',
    name: 'Admin User',
    email: 'admin@codveda.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6G', // admin123
    age: 30,
    department: 'engineering',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6G', // password123
    age: 28,
    department: 'engineering',
    role: 'user',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: '3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6G',
    age: 25,
    department: 'design',
    role: 'user',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];
let nextId = 4;

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authorized' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u._id === decoded.id && u.isActive);
    
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Not authorized' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as admin' });
  }
};

// Generate token
const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, age, department } = req.body;
    
    if (users.find(u => u.email === email.toLowerCase())) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = {
      _id: String(nextId++),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      age: age || null,
      department: department || '',
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    const token = generateToken(newgetUserModel()._id);
    
    res.status(201).json({
      success: true,
      message: 'User registered',
      token,
      user: { ...newUser, password: undefined }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email.toLowerCase() && u.isActive);
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { ...user, password: undefined }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', protect, (req, res) => {
  res.json({ success: true, user: { ...req.user, password: undefined } });
});

app.put('/api/auth/update-profile', protect, async (req, res) => {
  const { name, age, department } = req.body;
  const user = users.find(u => u._id === req.user._id);
  
  if (name) user.name = name;
  if (age !== undefined) user.age = age;
  if (department !== undefined) user.department = department;
  
  res.json({
    success: true,
    message: 'Profile updated',
    user: { ...user, password: undefined }
  });
});

// User Routes (Admin only)
app.get('/api/users', protect, adminOnly, (req, res) => {
  const activeUsers = users
    .filter(u => u.isActive)
    .map(u => ({ ...u, password: undefined }));
  
  res.json({
    success: true,
    users: activeUsers,
    pagination: { current: 1, pages: 1, total: activeUsers.length, limit: 10 }
  });
});

app.get('/api/users/stats/overview', protect, adminOnly, (req, res) => {
  const activeUsers = users.filter(u => u.isActive);
  const deptStats = {};
  const roleStats = {};
  
  activeUsers.forEach(u => {
    deptStats[u.department || 'none'] = (deptStats[u.department || 'none'] || 0) + 1;
    roleStats[u.role] = (roleStats[u.role] || 0) + 1;
  });
  
  res.json({
    success: true,
    stats: {
      totalUsers: activeUsers.length,
      newToday: 0,
      departmentStats: Object.entries(deptStats).map(([k, v]) => ({ _id: k, count: v })),
      roleStats: Object.entries(roleStats).map(([k, v]) => ({ _id: k, count: v }))
    }
  });
});

app.delete('/api/users/:id', protect, adminOnly, (req, res) => {
  const user = users.find(u => u._id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  user.isActive = false;
  res.json({ success: true, message: 'User deleted' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Level 2 API Server Running (Memory Mode)',
    timestamp: new Date().toISOString(),
    database: 'in-memory (demo mode)'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Mode: In-Memory (No MongoDB required)`);
  console.log(`👤 Default login: admin@codveda.com / admin123`);
  console.log(`   Alternate: john@example.com / password123\n`);
});
