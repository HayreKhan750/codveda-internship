const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PubSub } = require('graphql-subscriptions');
const { GraphQLScalarType, Kind } = require('graphql');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const pubsub = new PubSub();

const MESSAGE_RECEIVED = 'MESSAGE_RECEIVED';
const NOTIFICATION_RECEIVED = 'NOTIFICATION_RECEIVED';
const USER_STATUS_UPDATE = 'USER_STATUS_UPDATE';

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    if (value instanceof Date) return value.toISOString();
    return value; // fallback
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) return new Date(ast.value);
    return null;
  },
});

const resolvers = {
  Date: dateScalar,
  
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await User.findById(user.id);
    },

    users: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await User.find({ isActive: true, _id: { $ne: user.id } }).sort({ name: 1 });
    },

    user: async (_, { id }, { user }) => {
      if (!user) throw new Error('Authentication required');
      if (user.role !== 'admin' && user.id !== id) throw new Error('Access denied');
      return await User.findById(id);
    },

    messages: async (_, { userId }, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await Message.find({
        $or: [
          { sender: user.id, recipient: userId },
          { sender: userId, recipient: user.id }
        ]
      })
      .sort({ createdAt: 1 })
      .populate('sender recipient');
    },

    conversations: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      const msgs = await Message.find({
        $or: [{ sender: user.id }, { recipient: user.id }]
      }).distinct('sender recipient'.split(' ').includes);
      return await User.find({ isActive: true, _id: { $ne: user.id } }).sort({ name: 1 });
    },

    notifications: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await Notification.find({ user: user.id })
        .sort({ createdAt: -1 })
        .populate('user');
    },

    unreadNotifications: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await Notification.find({ user: user.id, isRead: false })
        .sort({ createdAt: -1 })
        .populate('user');
    },

    userStats: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      const totalUsers = await User.countDocuments({ isActive: true });
      const onlineUsers = await User.countDocuments({ isActive: true, isOnline: true });
      const totalMessages = await Message.countDocuments();
      const deptAgg = await User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      return {
        totalUsers,
        onlineUsers,
        totalMessages,
        departmentBreakdown: deptAgg.map(d => ({ department: d._id || 'Unassigned', count: d.count }))
      };
    }
  },

  Mutation: {
    register: async (_, { name, email, password, age, department }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('User already exists');

      const user = new User({
        name,
        email,
        password, // Hashing is handled by pre-save hook in User model
        age,
        department,
        role: 'user'
      });

      await user.save();

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email, isActive: true }).select('+password');
      if (!user) throw new Error('Invalid credentials');

      const isValid = await user.comparePassword(password);
      if (!isValid) throw new Error('Invalid credentials');

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return { token, user };
    },

    updateProfile: async (_, { name, age, department }, { user }) => {
      if (!user) throw new Error('Authentication required');

      const updateData = {};
      if (name) updateData.name = name;
      if (age) updateData.age = age;
      if (department) updateData.department = department;

      return await User.findByIdAndUpdate(
        user.id,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
    },

    sendMessage: async (_, { recipientId, content }, { user }) => {
      if (!user) throw new Error('Authentication required');
      const message = new Message({ sender: user.id, recipient: recipientId, content, isRead: false });
      await message.save();
      const populated = await Message.findById(message._id).populate('sender recipient');
      pubsub.publish(`MESSAGE_SENT_${recipientId}`, { messageSent: populated });
      return populated;
    },

    updateMessage: async (_, { messageId, content }, { user }) => {
      if (!user) throw new Error('Authentication required');
      const message = await Message.findById(messageId);
      if (!message) throw new Error('Message not found');
      if (String(message.sender._id) !== String(user.id)) throw new Error('Access denied');
      const updated = await Message.findByIdAndUpdate(messageId, { content }, { new: true }).populate('sender recipient');
      return updated;
    },

    deleteMessage: async (_, { messageId }, { user }) => {
      if (!user) throw new Error('Authentication required');
      const message = await Message.findById(messageId);
      if (!message) throw new Error('Message not found');
      if (String(message.sender._id) !== String(user.id)) throw new Error('Access denied');
      await Message.findByIdAndDelete(messageId);
      return true;
    },

    markAsRead: async (_, { messageId }, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await Message.findByIdAndUpdate(messageId, { isRead: true, status: 'read' }, { new: true }).populate('sender recipient');
    },

    markNotificationsRead: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      await Notification.updateMany({ user: user.id, isRead: false }, { isRead: true });
      return true;
    },


    createNotification: async (_, { userId, type, title, message }, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      const notification = new Notification({
        user: userId,
        type,
        title,
        message
      });

      await notification.save();
      const populatedNotification = await notification.populate('user');

      pubsub.publish(`${NOTIFICATION_RECEIVED}_${userId}`, {
        notificationReceived: populatedNotification
      });

      return populatedNotification;
    },

    updateUserRole: async (_, { userId, role }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Admin access required');
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role, updatedAt: new Date() },
        { new: true }
      );

      if (!updatedUser) throw new Error('User not found');
      return updatedUser;
    },

    deactivateUser: async (_, { userId }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Admin access required');
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      );

      if (!updatedUser) throw new Error('User not found');
      return updatedUser;
    }
  },

  Subscription: {
    messageSent: {
      subscribe: (_, { userId }) => pubsub.asyncIterator([`MESSAGE_SENT_${userId}`]),
      resolve: (payload) => payload.messageSent
    },
    notificationReceived: {
      subscribe: (_, __, { user }) => pubsub.asyncIterator([`${NOTIFICATION_RECEIVED}_${user?.id}`]),
      resolve: (payload) => payload.notificationReceived
    },
    userStatusUpdate: {
      subscribe: () => pubsub.asyncIterator([USER_STATUS_UPDATE]),
      resolve: (payload) => payload.userStatusUpdate
    }
  }
};

module.exports = resolvers;
