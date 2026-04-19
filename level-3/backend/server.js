const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

dotenv.config();

const app = express();
const server = http.createServer(app);
const allowedOrigin = (origin, callback) => {
  if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || origin === process.env.CLIENT_URL) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

const io = socketIo(server, {
  cors: { origin: allowedOrigin, methods: ['GET', 'POST'], credentials: true }
});

const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codveda_level3');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log('\n⚠️  Make sure MongoDB is running!');
    console.log('   Install: sudo apt install mongodb / brew install mongodb-community');
    console.log('   Start:   sudo systemctl start mongod / brew services start mongodb-community\n');
    process.exit(1);
  }
};

connectDB();

const { createApolloServer, createContext } = require('./graphql');
const { expressMiddleware } = require('@apollo/server/express4');
const User = require('./models/User');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

const startServer = async () => {
  const apolloServer = await createApolloServer(server);
  
  app.use('/graphql', expressMiddleware(apolloServer, {
    context: createContext
  }));

  const connectedUsers = new Map();


io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('join-user-room', async (userId) => {
    socket.join(`user-${userId}`);
    connectedUsers.set(socket.id, userId);
    console.log(`User ${userId} joined their room`);

    try {
      await User.findByIdAndUpdate(userId, { isOnline: true });
      socket.broadcast.emit('user-status-update', {
        userId,
        status: 'online',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating online status:', err);
    }
  });

  socket.on('send-message', (data) => {
    const { recipientId, message, senderId } = data;
    
    io.to(`user-${recipientId}`).emit('receive-message', {
      message,
      senderId,
      timestamp: new Date().toISOString()
    });
    
    socket.emit('message-sent', {
      recipientId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('send-notification', (data) => {
    const { userId, type, title, message } = data;
    
    io.to(`user-${userId}`).emit('receive-notification', {
      type,
      title,
      message,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('update-status', (data) => {
    const { userId, status } = data;
    
    socket.broadcast.emit('user-status-update', {
      userId,
      status,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', async () => {
    const userId = connectedUsers.get(socket.id);
    connectedUsers.delete(socket.id);
    console.log(`User disconnected: ${socket.id} (User: ${userId})`);
    
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, { isOnline: false });
        socket.broadcast.emit('user-status-update', {
          userId,
          status: 'offline',
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error updating offline status:', err);
      }
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Level 3 API Server Running with WebSockets & GraphQL',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    connectedUsers: connectedUsers.size,
    features: ['REST API', 'WebSockets', 'GraphQL', 'Authentication', 'Rate Limiting']
  });
});

app.get('/api/websockets/status', (req, res) => {
  res.json({
    connectedUsers: connectedUsers.size,
    users: Array.from(connectedUsers.values()),
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

  server.listen(PORT, () => {
    console.log(`🚀 ProChat Server running on port ${PORT}`);
    console.log(`📡 Real-time WebSockets enabled`);
    console.log(`🔒 Security features enabled`);
    console.log(`⚡ Performance optimizations enabled`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5174'}`);
  });
};

startServer();

