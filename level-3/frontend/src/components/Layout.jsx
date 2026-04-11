import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import NotificationCenter from './NotificationCenter'
import socketService from '../services/socketService'
import './Layout.css'

const Layout = () => {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const API_URL = import.meta.env.VITE_SERVER_URL ? `${import.meta.env.VITE_SERVER_URL}/api` : 'http://localhost:5001/api'
  const navigate = useNavigate()

  const handleLogout = () => {
    // Disconnect socket before logout
    socketService.disconnect()
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <i className="fas fa-comments"></i>
            <span>ProChat</span>
          </div>
          <p className="subtitle">Professional Real-Time Messaging</p>
        </div>

        <nav className="sidebar-nav">
          <Link 
            to="/dashboard" 
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <i className="fas fa-chart-pie"></i>
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/chat" 
            className={`nav-item ${isActive('/chat') ? 'active' : ''}`}
          >
            <i className="fas fa-comments"></i>
            <span>Messages</span>
          </Link>
          
          <Link 
            to="/profile" 
            className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
          >
            <i className="fas fa-user-circle"></i>
            <span>Profile</span>
          </Link>
          
          {isAdmin && (
            <Link 
              to="/users" 
              className={`nav-item ${isActive('/users') ? 'active' : ''}`}
            >
              <i className="fas fa-users-cog"></i>
              <span>User Management</span>
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name}</p>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <h1>{location.pathname.replace('/', '').charAt(0).toUpperCase() + location.pathname.slice(2)}</h1>
          <div className="header-actions">
            <NotificationCenter currentUser={user} />
            <span className="badge">
              <i className="fas fa-shield-alt"></i>
              {isAdmin ? 'Admin' : 'User'}
            </span>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
