import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import { useAuth } from '../contexts/AuthContext'
import socketService from '../services/socketService'
import ConfirmModal from '../components/ConfirmModal'
import {
  GET_USERS, GET_MESSAGES, SEND_MESSAGE, MARK_AS_READ, MESSAGE_SENT, UPDATE_MESSAGE, DELETE_MESSAGE
} from '../graphql/operations'

const Chat = () => {
  const { user } = useAuth()
  const [selectedUser, setSelectedUser] = useState(null)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [editingMessage, setEditingMessage] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState(null)
  const messagesEndRef = useRef(null)

  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useQuery(GET_USERS)

  const { data: msgData, loading: msgLoading, refetch } = useQuery(GET_MESSAGES, {
    variables: { userId: selectedUser?.id },
    skip: !selectedUser,
    fetchPolicy: 'network-only',
  })

  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE, {
    onCompleted: () => {
      setInput('')
      refetch()
    },
  })

  const [updateMessage, { loading: updating }] = useMutation(UPDATE_MESSAGE, {
    onCompleted: () => {
      setEditingMessage(null)
      setEditContent('')
      refetch()
    },
  })

  const [deleteMessage] = useMutation(DELETE_MESSAGE, {
    onCompleted: () => {
      refetch()
    },
  })

  const [markAsRead] = useMutation(MARK_AS_READ)

  useSubscription(MESSAGE_SENT, {
    variables: { userId: user?.id },
    skip: !user?.id,
    onData: ({ data }) => {
      const msg = data?.data?.messageSent
      if (msg && (msg.sender.id === selectedUser?.id || msg.recipient.id === selectedUser?.id)) {
        refetch()
      }
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgData])

  useEffect(() => {
    if (!user?.id) return

    socketService.connect()
    
    socketService.joinUserRoom(user.id)

    const handleStatusUpdate = ({ userId, status }) => {
      refetchUsers()
    }
    
    socketService.onUserStatusUpdate(handleStatusUpdate)

    return () => {
      socketService.off('user-status-update', handleStatusUpdate)
    }
  }, [user?.id, refetchUsers])

  useEffect(() => {
    if (msgData?.messages && selectedUser) {
      msgData.messages
        .filter(m => !m.isRead && m.sender.id === selectedUser.id)
        .forEach(m => markAsRead({ variables: { messageId: m.id } }))
    }
  }, [msgData, selectedUser, markAsRead])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || !selectedUser) return
    sendMessage({ variables: { recipientId: selectedUser.id, content: input.trim() } })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) }
  }

  const handleEdit = (msg) => {
    setEditingMessage(msg.id)
    setEditContent(msg.content)
  }

  const handleCancelEdit = () => {
    setEditingMessage(null)
    setEditContent('')
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editContent.trim() || !editingMessage) return
    updateMessage({ variables: { messageId: editingMessage, content: editContent.trim() } })
  }

  const handleDelete = (messageId) => {
    setMessageToDelete(messageId)
    setDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (messageToDelete) {
      deleteMessage({ variables: { messageId: messageToDelete } })
    }
    setDeleteModalOpen(false)
    setMessageToDelete(null)
  }

  const cancelDelete = () => {
    setDeleteModalOpen(false)
    setMessageToDelete(null)
  }

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content)
  }

  const allUsers = (usersData?.users || []).filter(u => u.id !== user?.id)
  const filteredUsers = search
    ? allUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : allUsers

  const messages = msgData?.messages || []

  const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const fmtTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const fmtDate = (ts) => {
    const d = new Date(ts)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return 'Today'
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const groupedMessages = messages.reduce((groups, msg) => {
    const key = fmtDate(msg.createdAt)
    if (!groups[key]) groups[key] = []
    groups[key].push(msg)
    return groups
  }, {})

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <div style={{ width: 300, borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', flexShrink: 0 }}>
        <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 'var(--spacing-sm)' }}>
            <i className="fas fa-comments" style={{ color: 'var(--primary-light)', marginRight: 8 }}></i> Messages
          </h2>
          <div style={{ position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 12 }}></i>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users…"
              style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px 8px 32px', fontSize: 13, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {usersLoading ? (
            <div style={{ padding: 20, textAlign: 'center' }}><div className="spinner"></div></div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="fas fa-users" style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}></i>
              <p style={{ fontSize: 14 }}>No users found</p>
            </div>
          ) : filteredUsers.map(u => (
            <button
              key={u.id}
              onClick={() => setSelectedUser(u)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', border: 'none', textAlign: 'left',
                background: selectedUser?.id === u.id
                  ? 'linear-gradient(90deg, rgba(124,58,237,0.15), rgba(124,58,237,0.05))'
                  : 'transparent',
                borderLeft: selectedUser?.id === u.id ? '3px solid var(--primary)' : '3px solid transparent',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { if (selectedUser?.id !== u.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              onMouseLeave={e => { if (selectedUser?.id !== u.id) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: selectedUser?.id === u.id
                    ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                    : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, color: 'white',
                  boxShadow: selectedUser?.id === u.id ? '0 4px 12px rgba(124,58,237,0.4)' : 'none'
                }}>{initials(u.name)}</div>
                {u.isOnline && <span style={{
                  position: 'absolute', bottom: 2, right: 2,
                  width: 11, height: 11, background: '#10b981',
                  borderRadius: '50%', border: '2px solid var(--bg-primary)',
                  boxShadow: '0 0 6px #10b981'
                }}></span>}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: selectedUser?.id === u.id ? 'var(--primary-light)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>{u.name}</p>
                <p style={{ fontSize: 11, color: u.isOnline ? '#10b981' : 'var(--text-muted)', textTransform: 'capitalize', fontWeight: u.isOnline ? 600 : 400 }}>
                  {u.isOnline ? '● Online' : '○ Offline'} {u.department ? `· ${u.department}` : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
      {!selectedUser ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-md)', color: 'var(--text-muted)' }}>
          <i className="fas fa-comment-dots" style={{ fontSize: 56, opacity: .3 }}></i>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)' }}>Select a Conversation</h3>
          <p style={{ fontSize: 14 }}>Choose someone from the left to start chatting</p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: 'var(--spacing-md) var(--spacing-xl)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', background: 'var(--bg-primary)', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <div className="avatar">{initials(selectedUser.name)}</div>
              {selectedUser.isOnline && <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, background: 'var(--accent)', borderRadius: '50%', border: '2px solid var(--bg-primary)' }}></span>}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{selectedUser.name}</p>
              <p style={{ fontSize: 12, color: selectedUser.isOnline ? 'var(--accent)' : 'var(--text-muted)' }}>
                {selectedUser.isOnline ? 'Online' : 'Offline'} · {selectedUser.email}
              </p>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {msgLoading ? (
              <div className="loading-center"><div className="spinner"></div><p>Loading messages…</p></div>
            ) : messages.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-comment-slash"></i>
                <h3>No messages yet</h3>
                <p>Send the first message to start the conversation!</p>
              </div>
            ) : Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date} style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', margin: 'var(--spacing-md) 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }}></div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '2px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', border: '1px solid var(--glass-border)' }}>{date}</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }}></div>
                </div>
                {msgs.map(msg => {
                  const currentUserId = user?.id || user?._id
                  const senderId = msg.sender.id || msg.sender._id
                  const isMine = String(senderId) === String(currentUserId)
                  const isEditing = editingMessage === msg.id
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', marginBottom: 6, width: '100%' }}>
                      <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, marginRight: isMine ? 0 : 8, marginLeft: isMine ? 8 : 0, flexShrink: 0, alignSelf: 'flex-end', visibility: 'visible' }}>{initials(isMine ? user?.name : msg.sender.name)}</div>
                      <div style={{ maxWidth: '65%', marginLeft: isMine ? 'auto' : 0, marginRight: isMine ? 0 : 'auto' }}>
                        {isEditing ? (
                          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <input
                              value={editContent}
                              onChange={e => setEditContent(e.target.value)}
                              autoFocus
                              style={{
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '10px 14px',
                                fontSize: 14,
                                fontFamily: 'inherit',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                width: '100%'
                              }}
                              onKeyDown={e => { if (e.key === 'Escape') handleCancelEdit() }}
                            />
                            <div style={{ display: 'flex', gap: 8, justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                style={{ padding: '6px 12px', fontSize: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={updating || !editContent.trim()}
                                style={{ padding: '6px 12px', fontSize: 12, borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', opacity: updating || !editContent.trim() ? 0.5 : 1 }}
                              >
                                {updating ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div style={{ position: 'relative', group: 'hover' }}>
                            <div style={{
                              background: isMine ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'var(--bg-secondary)',
                              color: isMine ? 'white' : 'var(--text-primary)',
                              padding: '10px 14px',
                              borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              fontSize: 14, lineHeight: 1.5,
                              boxShadow: isMine ? '0 4px 16px rgba(124,58,237,.3)' : 'var(--shadow-sm)',
                              border: isMine ? 'none' : '1px solid var(--glass-border)',
                            }}>
                              {msg.content}
                            </div>
                            <div style={{
                              position: 'absolute',
                              top: -8,
                              right: isMine ? -8 : 'auto',
                              left: isMine ? 'auto' : -8,
                              display: 'flex',
                              gap: 4,
                              opacity: 0,
                              transition: 'opacity 0.2s',
                            }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                              <button
                                onClick={() => handleCopy(msg.content)}
                                title="Copy"
                                style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}
                              >
                                <i className="fas fa-copy"></i>
                              </button>
                              {isMine && (
                                <>
                                  <button
                                    onClick={() => handleEdit(msg)}
                                    title="Edit"
                                    style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(msg.id)}
                                    title="Delete"
                                    style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, textAlign: isMine ? 'right' : 'left', display: 'flex', alignItems: 'center', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: 4 }}>
                          {fmtTime(msg.createdAt)}
                          {isMine && <i className={`fas ${msg.isRead ? 'fa-check-double' : 'fa-check'}`} style={{ fontSize: 10, color: msg.isRead ? 'var(--accent-light)' : 'inherit' }}></i>}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} style={{ padding: 'var(--spacing-md) var(--spacing-xl)', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 'var(--spacing-sm)', background: 'var(--bg-primary)', flexShrink: 0 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${selectedUser.name}…`}
              style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '10px 18px', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', transition: 'var(--transition)' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', border: 'none', color: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'var(--transition)', boxShadow: '0 4px 12px rgba(124,58,237,.4)', opacity: !input.trim() || sending ? .5 : 1 }}
            >
              {sending ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,.3)', borderTopColor: 'white' }}></span>
                : <i className="fas fa-paper-plane"></i>}
            </button>
          </form>
        </div>
      )}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}

export default Chat
