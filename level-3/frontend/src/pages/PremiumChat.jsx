import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import socketService from '../services/socketService'
import './PremiumChat.css'

const PremiumChat = () => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [usersLoading, setUsersLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userTyping, setUserTyping] = useState(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  
  const { user: currentUser } = useAuth()
  const API_URL = import.meta.env.VITE_SERVER_URL ? `${import.meta.env.VITE_SERVER_URL}/api` : 'http://localhost:5000/api'

  useEffect(() => {
    // Initialize socket connection
    socketService.connect()
    
    // Check socket connection
    const checkConnection = () => {
      setIsConnected(socketService.isConnected())
    }
    
    const interval = setInterval(checkConnection, 1000)
    checkConnection()

    // Fetch users
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const response = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setUsers(response.data.users || [])
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setUsersLoading(false)
      }
    }

    fetchUsers()

    // Socket event listeners
    const handleReceiveMessage = (data) => {
      if (selectedUser && data.senderId === selectedUser._id) {
        setMessages(prev => [...prev, {
          ...data,
          id: Date.now(),
          timestamp: data.timestamp || new Date().toISOString()
        }])
      }
    }

    const handleUserTyping = (data) => {
      if (selectedUser && data.userId === selectedUser._id) {
        setUserTyping(data.userId)
        setTimeout(() => setUserTyping(null), 3000)
      }
    }

    socketService.onMessage(handleReceiveMessage)
    socketService.onTyping(handleUserTyping)

    return () => {
      clearInterval(interval)
    }
  }, [selectedUser])

  useEffect(() => {
    if (selectedUser && currentUser) {
      // Join user room for real-time messaging
      socketService.joinUserRoom(currentUser._id)
      
      // Load initial messages (in a real app, this would load from backend)
      setMessages([])
    }
  }, [selectedUser, currentUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setMessages([])
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!message.trim() || !selectedUser || !isConnected) return

    const newMessage = {
      id: Date.now(),
      content: message.trim(),
      senderId: currentUser._id,
      recipientId: selectedUser._id,
      timestamp: new Date().toISOString(),
      status: 'sent'
    }

    try {
      // Add message to UI immediately
      setMessages(prev => [...prev, newMessage])
      setMessage('')

      // Send via WebSocket for real-time delivery
      socketService.sendMessage(selectedUser._id, message.trim(), currentUser._id)
      
      // Update message status to delivered
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ))
      }, 500)

      // Update message status to read (simulate)
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
        ))
      }, 2000)

    } catch (error) {
      console.error('Error sending message:', error)
      // Remove message if failed
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id))
    }
  }

  const handleTyping = (e) => {
    setMessage(e.target.value)
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true)
      socketService.sendTyping(currentUser._id, selectedUser?._id)
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'
  }

  const filteredUsers = users.filter(user => 
    user._id !== currentUser?._id &&
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (usersLoading) {
    return (
      <div className="premium-chat-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Loading conversations...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="premium-chat-container">
      {/* Header */}
      <div className="chat-header">
        <h1>
          <div className="logo-icon">💬</div>
          ProChat
        </h1>
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      <div className="chat-content">
        {/* Conversations Sidebar */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
            <div className="search-container">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search conversations..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="conversations-list">
            {filteredUsers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <h3>No conversations yet</h3>
                <p>Start a new conversation with your team members</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className={`conversation-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="conversation-avatar">
                    {getInitials(user.name)}
                    <div className="online-indicator"></div>
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-name">{user.name}</div>
                    <div className="conversation-message">
                      {user.role} • {user.department}
                    </div>
                  </div>
                  <div className="conversation-meta">
                    <span className="conversation-time">now</span>
                    {Math.random() > 0.8 && (
                      <div className="unread-badge">
                        {Math.floor(Math.random() * 5) + 1}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedUser ? (
            <>
              {/* Chat Header Bar */}
              <div className="chat-header-bar">
                <div className="chat-user-info">
                  <div className="chat-user-avatar">
                    {getInitials(selectedUser.name)}
                  </div>
                  <div className="chat-user-details">
                    <h3>{selectedUser.name}</h3>
                    <p>Active now • {selectedUser.role}</p>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="chat-action-btn">
                    <i className="fas fa-phone"></i>
                  </button>
                  <button className="chat-action-btn">
                    <i className="fas fa-video"></i>
                  </button>
                  <button className="chat-action-btn">
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">💭</div>
                    <h3>Start the conversation</h3>
                    <p>Say hello to {selectedUser.name}!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isSent = msg.senderId === currentUser._id
                      const showDate = index === 0 || 
                        new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString()
                      
                      return (
                        <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                          {showDate && (
                            <div className="date-separator">
                              <span>{formatMessageDate(msg.timestamp)}</span>
                            </div>
                          )}
                          <div className={`message ${isSent ? 'sent' : 'received'}`}>
                            {!isSent && (
                              <div className="message-avatar">
                                {getInitials(selectedUser.name)}
                              </div>
                            )}
                            <div className="message-content">
                              <div className="message-bubble">
                                <p>{msg.content}</p>
                                <div className="message-meta">
                                  <span className="message-time">
                                    {formatTimestamp(msg.timestamp)}
                                  </span>
                                  {isSent && (
                                    <div className={`message-status status-${msg.status}`}>
                                      {msg.status === 'sent' && '✓'}
                                      {msg.status === 'delivered' && '✓✓'}
                                      {msg.status === 'read' && '✓✓'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            {isSent && (
                              <div className="message-avatar">
                                {getInitials(currentUser.name || 'You')}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Typing Indicator */}
                    {userTyping === selectedUser._id && (
                      <div className="message received">
                        <div className="message-avatar">
                          {getInitials(selectedUser.name)}
                        </div>
                        <div className="typing-indicator">
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="message-input-container">
                <form onSubmit={handleSendMessage}>
                  <div className="input-wrapper">
                    <button type="button" className="input-btn">
                      <i className="fas fa-paperclip"></i>
                    </button>
                    <input
                      type="text"
                      value={message}
                      onChange={handleTyping}
                      placeholder={isConnected ? "Type a message..." : "Connecting..."}
                      className="message-input"
                      disabled={!isConnected}
                    />
                    <button type="button" className="input-btn">
                      <i className="fas fa-smile"></i>
                    </button>
                    <button 
                      type="submit" 
                      className="input-btn send-btn"
                      disabled={!isConnected || !message.trim()}
                    >
                      <i className="fas fa-paper-plane"></i>
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <h3>Welcome to ProChat</h3>
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PremiumChat
