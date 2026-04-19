require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { body, param, query, validationResult } = require('express-validator');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/codveda_level1'
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('\n⚠️  Make sure MongoDB is running:');
    console.log('   sudo systemctl start mongod');
    process.exit(1);
  }
};

connectDB();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};


app.get('/api/users', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('department').optional().isString(),
  query('search').optional().isString(),
  validate,
], async (req, res) => {
  try {
    const page  = req.query.page  || 1;
    const limit = req.query.limit || 10;
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.search) {
      const rx = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

app.get('/api/users/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, addedToday, byDepartment, ageStats] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { department: { $ifNull: ['$_id', 'Unassigned'] }, count: 1, _id: 0 } },
      ]),
      User.aggregate([
        { $match: { age: { $ne: null } } },
        { $group: { _id: null, avgAge: { $avg: '$age' } } },
      ]),
    ]);

    res.json({
      total,
      addedToday,
      averageAge: ageStats[0] ? Math.round(ageStats[0].avgAge) : 0,
      byDepartment,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
  }
});

app.get('/api/users/:id', [
  param('id').isMongoId().withMessage('Invalid user ID'),
  validate,
], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
});

app.post('/api/users', [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('age').optional({ nullable: true })
    .isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120').toInt(),
  body('department').optional({ nullable: true })
    .isIn(['engineering', 'design', 'marketing', 'sales', 'hr', ''])
    .withMessage('Invalid department'),
  validate,
], async (req, res) => {
  try {
    const { name, email, age, department } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'A user with this email already exists' });

    const user = await User.create({ name, email, age: age || null, department: department || null });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Email already in use' });
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
});

app.post('/api/users/bulk', async (req, res) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'Provide an array of users under the "users" key' });
    }
    if (users.length > 500) {
      return res.status(400).json({ error: 'Bulk import is limited to 500 users at a time' });
    }

    const results = { created: 0, skipped: 0, errors: [] };
    for (const u of users) {
      try {
        await User.create({
          name: u.name,
          email: String(u.email).toLowerCase().trim(),
          age: u.age || null,
          department: u.department || null,
        });
        results.created++;
      } catch (e) {
        if (e.code === 11000) {
          results.skipped++;
        } else {
          results.errors.push({ email: u.email, reason: e.message });
        }
      }
    }

    res.status(207).json({ message: 'Bulk import complete', ...results });
  } catch (err) {
    res.status(500).json({ error: 'Bulk import failed', details: err.message });
  }
});

app.put('/api/users/:id', [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('age').optional({ nullable: true })
    .isInt({ min: 1, max: 120 }).withMessage('Age must be 1-120').toInt(),
  body('department').optional({ nullable: true })
    .isIn(['engineering', 'design', 'marketing', 'sales', 'hr', ''])
    .withMessage('Invalid department'),
  validate,
], async (req, res) => {
  try {
    const { name, email, age, department } = req.body;

    const conflict = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (conflict) return res.status(409).json({ error: 'Email is already used by another user' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, age: age || null, department: department || null },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
});

app.delete('/api/users/:id', [
  param('id').isMongoId().withMessage('Invalid user ID'),
  validate,
], async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'Codveda Level-1 API',
    version: '2.0.0',
    database: 'MongoDB (persistent)',
    endpoints: {
      users:    'GET/POST    /api/users',
      user:     'GET/PUT/DEL /api/users/:id',
      bulk:     'POST        /api/users/bulk',
      stats:    'GET         /api/users/stats',
      health:   'GET         /api/health',
    },
  });
});

app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'OK',
    message: 'Level-1 API running with MongoDB',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Level-1 API running on http://localhost:${PORT}`);
  console.log(`📦 Database: MongoDB (persistent)`);
  console.log(`🔒 Security: Helmet enabled`);
});
