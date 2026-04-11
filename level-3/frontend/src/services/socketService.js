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

  joinUserRoom(userId) {
    if (this.socket) {
      this.socket.emit('join-user-room', userId);
    }
  }

  sendMessage(recipientId, message, senderId) {
    if (this.socket) {
      this.socket.emit('send-message', {
        recipientId,
        message,
        senderId
      });
    }
  }

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

  sendTyping(userId, recipientId) {
    if (this.socket) {
      this.socket.emit('typing', {
        userId,
        recipientId
      });
    }
  }

  updateStatus(userId, status) {
    if (this.socket) {
      this.socket.emit('update-status', {
        userId,
        status
      });
    }
  }

  onMessage(callback) {
    if (this.socket) {
      this.socket.on('receive-message', callback);
    }
  }

  onMessageSent(callback) {
    if (this.socket) {
      this.socket.on('message-sent', callback);
    }
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.on('receive-notification', callback);
    }
  }

  onTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  onUserStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('user-status-update', callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new SocketService();
