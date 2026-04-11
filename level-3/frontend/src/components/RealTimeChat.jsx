import React, { useState, useEffect, useRef } from 'react';
import socketService from '../services/socketService';
import './RealTimeChat.css';

const RealTimeChat = ({ currentUser, recipientId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (currentUser && currentUser.token) {
      socketService.connect(currentUser.token);
      socketService.joinUserRoom(currentUser._id);
      setIsConnected(socketService.isConnected());

      // Listen for incoming messages
      socketService.onMessage((data) => {
        if (data.senderId === recipientId || data.recipientId === currentUser._id) {
          setMessages(prev => [...prev, data]);
        }
      });

      // Listen for connection status
      socketService.on('connect', () => setIsConnected(true));
      socketService.on('disconnect', () => setIsConnected(false));

      return () => {
        socketService.off('receive-message');
        socketService.off('connect');
        socketService.off('disconnect');
      };
    }
  }, [currentUser, recipientId]);

  // Initialize empty messages array
  useEffect(() => {
    setMessages([]);
  }, [recipientId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !recipientId) return;

    try {
      // Send via WebSocket for real-time delivery
      socketService.sendMessage(recipientId, message, currentUser._id);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  if (!recipientId) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h3>Select a user to start chatting</h3>
        </div>
        <div className="chat-messages">
          <div className="no-chat-selected">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <h3 style={{ color: '#e5e7eb', marginBottom: '8px' }}>Welcome to Chat</h3>
              <p style={{ color: '#9ca3af' }}>Choose a user from the list to begin real-time messaging</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>
          <span className="message-avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
            {getInitials('Chat User')}
          </span>
          Real-Time Chat
        </h3>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-chat-selected">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>🚀</div>
              <h3 style={{ color: '#e5e7eb', marginBottom: '8px' }}>Start the conversation!</h3>
              <p style={{ color: '#9ca3af' }}>Send your first message to begin real-time chatting</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isSent = msg.senderId === currentUser._id;
              const showDate = index === 0 || 
                new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();
              
              return (
                <React.Fragment key={index}>
                  {showDate && (
                    <div className="date-separator">
                      <span>{formatMessageDate(msg.timestamp)}</span>
                    </div>
                  )}
                  <div className={`message ${isSent ? 'sent' : 'received'}`}>
                    {!isSent && (
                      <div className="message-avatar">
                        {getInitials(msg.senderName || 'User')}
                      </div>
                    )}
                    <div className="message-content">
                      <div className="message-bubble">
                        <p>{msg.content}</p>
                        <span className="message-time">
                          {formatTimestamp(msg.timestamp)}
                          {isSent && (
                            <span className="message-status status-read">✓✓</span>
                          )}
                        </span>
                      </div>
                    </div>
                    {isSent && (
                      <div className="message-avatar">
                        {getInitials(currentUser.name || 'You')}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </>
        )}
        
        {/* Typing Indicator */}
        {false && (
          <div className="message received">
            <div className="message-avatar">...</div>
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            className="message-input"
            disabled={!isConnected || !recipientId}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!isConnected || !recipientId || !message.trim()}
          >
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
            </svg>
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default RealTimeChat;
