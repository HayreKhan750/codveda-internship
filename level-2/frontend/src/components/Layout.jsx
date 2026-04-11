import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

const Layout = () => {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <i className="fas fa-code"></i>
            <span>Codveda L2</span>
          </div>
          <p className="subtitle">MERN + Auth</p>
        </div>

        <nav className="sidebar-nav">
          <Link 
            to="/dashboard" 
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </Link>
          
          {isAdmin && (
            <Link 
              to="/users" 
              className={`nav-item ${isActive('/users') ? 'active' : ''}`}
            >
              <i className="fas fa-users"></i>
              <span>Users</span>
            </Link>
          )}
          
          <Link 
            to="/profile" 
            className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
          >
            <i className="fas fa-user"></i>
            <span>Profile</span>
          </Link>
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
