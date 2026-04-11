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

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const allowedOrigin = (origin, callback) => {
  // Allow any localhost port, or the configured CLIENT_URL
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

// Security & Performance Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Middleware
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codveda_level2');
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

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Initialize Apollo Server and WebSocket
const startServer = async () => {
  const apolloServer = await createApolloServer(server);
  
  app.use('/graphql', expressMiddleware(apolloServer, {
    context: createContext
  }));

  // WebSockets - Real-time communication
  const connectedUsers = new Map();


io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join user to their personal room for notifications
  socket.on('join-user-room', async (userId) => {
    socket.join(`user-${userId}`);
    connectedUsers.set(socket.id, userId);
    console.log(`User ${userId} joined their room`);
    
    // Update user's online status in database
    try {
      await User.findByIdAndUpdate(userId, { isOnline: true });
      // Broadcast to all clients that user is online
      socket.broadcast.emit('user-status-update', {
        userId,
        status: 'online',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating online status:', err);
    }
  });

  // Handle real-time chat messages
  socket.on('send-message', (data) => {
    const { recipientId, message, senderId } = data;
    
    // Send to specific user room
    io.to(`user-${recipientId}`).emit('receive-message', {
      message,
      senderId,
      timestamp: new Date().toISOString()
    });
    
    // Send confirmation to sender
    socket.emit('message-sent', {
      recipientId,
      timestamp: new Date().toISOString()
    });
  });

  // Handle live notifications
  socket.on('send-notification', (data) => {
    const { userId, type, title, message } = data;
    
    io.to(`user-${userId}`).emit('receive-notification', {
      type,
      title,
      message,
      timestamp: new Date().toISOString()
    });
  });

  // Handle user status updates
  socket.on('update-status', (data) => {
    const { userId, status } = data;
    
    // Broadcast to all connected clients
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
    
    // Update user's online status in database and notify others
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

// Health check
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

// WebSocket status endpoint
app.get('/api/websockets/status', (req, res) => {
  res.json({
    connectedUsers: connectedUsers.size,
    users: Array.from(connectedUsers.values()),
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
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

