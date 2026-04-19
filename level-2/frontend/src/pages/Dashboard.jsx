import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import './Dashboard.css'

const API_URL = 'http://localhost:5001/api'

const Dashboard = () => {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    newToday: 0,
    departmentStats: [],
    roleStats: []
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (isAdmin) {
          const statsRes = await axios.get(`${API_URL}/users/stats/overview`)
          setStats(statsRes.data.stats)
          const usersRes = await axios.get(`${API_URL}/users?limit=5&sort=-createdAt`)
          setRecentUsers(usersRes.data.users)
        }
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAdmin])

  const getDepartmentIcon = (dept) => {
    const icons = {
      engineering: 'fa-code',
      design: 'fa-paint-brush',
      marketing: 'fa-bullhorn',
      sales: 'fa-handshake',
      hr: 'fa-users',
      '': 'fa-building'
    }
    return icons[dept] || 'fa-building'
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Recently'
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Recently'
    }
  }

  const calculateProfileCompletion = () => {
    let completed = 0
    const fields = ['name', 'email', 'age', 'department']
    if (user?.name) completed++
    if (user?.email) completed++
    if (user?.age) completed++
    if (user?.department) completed++
    return Math.round((completed / fields.length) * 100)
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="hero-welcome">
        <div className="hero-content">
          <div className="greeting">{getGreeting()},</div>
          <h1 className="user-name">{user?.name}!</h1>
          <p className="welcome-subtitle">
            Welcome to your personal dashboard. Here&apos;s what&apos;s happening in your account today.
          </p>
          <div className="quick-stats">
            <span className="quick-stat">
              <i className="fas fa-calendar-alt"></i>
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <span className="quick-stat">
              <i className="fas fa-clock"></i>
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <div className="hero-avatar">
          <div className="avatar-ring">
            <div className="avatar-letter">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className={`status-indicator ${user?.role}`}></div>
          </div>
          <div className="role-badge-large">
            <i className="fas fa-shield-alt"></i>
            <span>{isAdmin ? 'Administrator' : 'Standard User'}</span>
          </div>
        </div>
      </div>

      {isAdmin ? (
        <>
          <div className="stats-grid">
            <div className="stat-card primary gradient-blue">
              <div className="stat-icon floating">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
                <span className="stat-trend">
                  <i className="fas fa-arrow-up"></i> +{stats.newToday} today
                </span>
              </div>
            </div>

            <div className="stat-card success gradient-green">
              <div className="stat-icon floating">
                <i className="fas fa-user-plus"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.newToday}</h3>
                <p>New Today</p>
                <span className="stat-trend">Active registrations</span>
              </div>
            </div>

            <div className="stat-card info gradient-purple">
              <div className="stat-icon floating">
                <i className="fas fa-user-shield"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.roleStats.find(r => r._id === 'admin')?.count || 0}</h3>
                <p>Admins</p>
                <span className="stat-trend">System managers</span>
              </div>
            </div>

            <div className="stat-card warning gradient-orange">
              <div className="stat-icon floating">
                <i className="fas fa-user"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.roleStats.find(r => r._id === 'user')?.count || 0}</h3>
                <p>Regular Users</p>
                <span className="stat-trend">Active members</span>
              </div>
            </div>
          </div>
          <div className="dashboard-section animated">
            <h3><i className="fas fa-building"></i> Department Distribution</h3>
            <div className="department-grid">
              {stats.departmentStats.map((dept, index) => (
                <div key={dept._id || 'none'} className="department-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="dept-icon animated-icon">
                    <i className={`fas ${getDepartmentIcon(dept._id)}`}></i>
                  </div>
                  <div className="dept-info">
                    <h4>{dept._id ? dept._id.charAt(0).toUpperCase() + dept._id.slice(1) : 'No Department'}</h4>
                    <div className="dept-progress">
                      <div className="progress-bar" style={{ width: `${(dept.count / stats.totalUsers) * 100}%` }}></div>
                    </div>
                    <span className="dept-count">{dept.count} users ({Math.round((dept.count / stats.totalUsers) * 100)}%)</span>
                  </div>
                </div>
              ))}
              {stats.departmentStats.length === 0 && (
                <p className="no-data">No department data available</p>
              )}
            </div>
          </div>
          <div className="dashboard-section animated">
            <h3><i className="fas fa-clock"></i> Recent Activity</h3>
            <div className="recent-users-list">
              {recentUsers.map((user, index) => (
                <div key={user._id} className="recent-user-item" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="user-avatar-small animated-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <h4>{user.name}</h4>
                    <p><i className="fas fa-envelope"></i> {user.email}</p>
                  </div>
                  <div className="user-meta">
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                    <span className="timestamp">
                      <i className="fas fa-calendar"></i> {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <p className="no-data">No recent users</p>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Regular User View - Enhanced */
        <div className="user-dashboard">
          <div className="info-card profile-completion-card">
            <div className="completion-header">
              <h3><i className="fas fa-chart-pie"></i> Profile Completion</h3>
              <span className="completion-percentage">{calculateProfileCompletion()}%</span>
            </div>
            <div className="completion-progress">
              <div className="progress-ring">
                <svg viewBox="0 0 100 100">
                  <circle className="progress-ring-bg" cx="50" cy="50" r="45" />
                  <circle 
                    className="progress-ring-fill" 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    style={{ strokeDashoffset: 283 - (283 * calculateProfileCompletion()) / 100 }}
                  />
                </svg>
                <div className="progress-text">{calculateProfileCompletion()}%</div>
              </div>
            </div>
            <p className="completion-message">
              {calculateProfileCompletion() === 100 
                ? '🎉 Amazing! Your profile is complete!' 
                : 'Complete your profile to unlock all features'}
            </p>
          </div>
          <div className="user-stats-row">
            <div className="user-stat-card">
              <div className="user-stat-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="user-stat-info">
                <span className="user-stat-value">{formatDate(user?.createdAt)}</span>
                <span className="user-stat-label">Member Since</span>
              </div>
            </div>
            <div className="user-stat-card">
              <div className="user-stat-icon department-icon">
                <i className={`fas ${getDepartmentIcon(user?.department)}`}></i>
              </div>
              <div className="user-stat-info">
                <span className="user-stat-value">{user?.department ? user.department.charAt(0).toUpperCase() + user.department.slice(1) : 'General'}</span>
                <span className="user-stat-label">Department</span>
              </div>
            </div>
            <div className="user-stat-card">
              <div className="user-stat-icon age-icon">
                <i className="fas fa-birthday-cake"></i>
              </div>
              <div className="user-stat-info">
                <span className="user-stat-value">{user?.age || 'N/A'}</span>
                <span className="user-stat-label">Age</span>
              </div>
            </div>
          </div>
          <div className="info-card profile-details">
            <h3><i className="fas fa-id-card"></i> Profile Information</h3>
            <div className="profile-grid">
              <div className="profile-item">
                <div className="profile-item-icon">
                  <i className="fas fa-user"></i>
                </div>
                <div className="profile-item-content">
                  <span className="profile-item-label">Full Name</span>
                  <span className="profile-item-value">{user?.name}</span>
                </div>
              </div>
              <div className="profile-item">
                <div className="profile-item-icon email-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="profile-item-content">
                  <span className="profile-item-label">Email Address</span>
                  <span className="profile-item-value">{user?.email}</span>
                </div>
              </div>
              <div className="profile-item">
                <div className="profile-item-icon role-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <div className="profile-item-content">
                  <span className="profile-item-label">Account Role</span>
                  <span className="profile-item-value">
                    <span className={`role-tag ${user?.role}`}>{user?.role}</span>
                  </span>
                </div>
              </div>
              <div className="profile-item">
                <div className="profile-item-icon status-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="profile-item-content">
                  <span className="profile-item-label">Account Status</span>
                  <span className="profile-item-value">
                    <span className="status-tag active">Active</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="info-card security-card">
            <h3><i className="fas fa-lock"></i> Security Status</h3>
            <div className="security-grid">
              <div className="security-badge">
                <div className="security-icon-wrapper success">
                  <i className="fas fa-key"></i>
                </div>
                <span>Password Protected</span>
              </div>
              <div className="security-badge">
                <div className="security-icon-wrapper success">
                  <i className="fas fa-fingerprint"></i>
                </div>
                <span>JWT Authentication</span>
              </div>
              <div className="security-badge">
                <div className="security-icon-wrapper success">
                  <i className="fas fa-user-shield"></i>
                </div>
                <span>Role-Based Access</span>
              </div>
              <div className="security-badge">
                <div className="security-icon-wrapper success">
                  <i className="fas fa-shield-virus"></i>
                </div>
                <span>Account Protected</span>
              </div>
            </div>
          </div>
          <div className="info-card quick-actions">
            <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
            <div className="action-buttons">
              <a href="/profile" className="action-btn primary">
                <i className="fas fa-edit"></i>
                <span>Edit Profile</span>
              </a>
              <a href="/profile" className="action-btn secondary">
                <i className="fas fa-key"></i>
                <span>Change Password</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
