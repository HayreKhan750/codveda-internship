import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connectedUsers = new Map();
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
      auth: {
        token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join user's personal room for notifications
  joinUserRoom(userId) {
    if (this.socket) {
      this.socket.emit('join-user-room', userId);
    }
  }

  // Send a message to another user
  sendMessage(recipientId, message, senderId) {
    if (this.socket) {
      this.socket.emit('send-message', {
        recipientId,
        message,
        senderId
      });
    }
  }

  // Send a notification to a user
  sendNotification(userId, type, title, message) {
    if (this.socket) {
      this.socket.emit('send-notification', {
        userId,
        type,
        title,
        message
      });
    }
  }

  // Send typing indicator
  sendTyping(userId, recipientId) {
    if (this.socket) {
      this.socket.emit('typing', {
        userId,
        recipientId
      });
    }
  }

  // Update user status
  updateStatus(userId, status) {
    if (this.socket) {
      this.socket.emit('update-status', {
        userId,
        status
      });
    }
  }

  // Listen for incoming messages
  onMessage(callback) {
    if (this.socket) {
      this.socket.on('receive-message', callback);
    }
  }

  // Listen for message sent confirmation
  onMessageSent(callback) {
    if (this.socket) {
      this.socket.on('message-sent', callback);
    }
  }

  // Listen for notifications
  onNotification(callback) {
    if (this.socket) {
      this.socket.on('receive-notification', callback);
    }
  }

  // Listen for typing indicators
  onTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  // Listen for user status updates
  onUserStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('user-status-update', callback);
    }
  }

  // Remove event listeners
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Get connection status
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new SocketService();
