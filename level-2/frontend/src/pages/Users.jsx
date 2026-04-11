import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import './Users.css'

const API_URL = 'http://localhost:5001/api'

const Users = () => {
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  })

  // Custom modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    age: '',
    department: '',
    role: 'user'
  })

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true)
      let url = `${API_URL}/users?page=${page}&limit=8`
      if (search) url += `&search=${search}`
      if (department) url += `&department=${department}`

      const response = await axios.get(url)
      setUsers(response.data.users)
      setPagination(response.data.pagination)
      setError(null)
    } catch (err) {
      setError('Failed to load users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchUsers(1)
    }
  }, [search, department, isAdmin])

  const handleDeleteClick = (userId) => {
    setDeleteTarget(userId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    
    setActionLoading(true)
    try {
      await axios.delete(`${API_URL}/users/${deleteTarget}`)
      setUsers(users.filter(user => user.id !== deleteTarget))
      setShowDeleteModal(false)
      setDeleteTarget(null)
    } catch (err) {
      setError('Failed to delete user')
    } finally {
      setActionLoading(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setDeleteTarget(null)
  }

  // Edit functionality
  const handleEditClick = (user) => {
    setEditTarget(user)
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      age: user.age || '',
      department: user.department || '',
      role: user.role || 'user'
    })
    setShowEditModal(true)
  }

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const confirmEdit = async () => {
    if (!editTarget) return
    
    setActionLoading(true)
    try {
      const response = await axios.put(`${API_URL}/users/${editTarget.id}`, editForm)
      setUsers(users.map(user => user.id === editTarget.id ? response.data.user : user))
      setShowEditModal(false)
      setEditTarget(null)
    } catch (err) {
      setError('Failed to update user')
    } finally {
      setActionLoading(false)
    }
  }

  const cancelEdit = () => {
    setShowEditModal(false)
    setEditTarget(null)
  }

  // Safe date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Recently'
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Recently'
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  const getDepartmentIcon = (dept) => {
    const icons = {
      engineering: 'fa-code',
      design: 'fa-paint-brush',
      marketing: 'fa-bullhorn',
      sales: 'fa-handshake',
      hr: 'fa-users'
    }
    return icons[dept] || 'fa-building'
  }

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <i className="fas fa-lock"></i>
        <h2>Access Denied</h2>
        <p>You need admin privileges to view this page.</p>
      </div>
    )
  }

  return (
    <div className="users-page">
      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="filter-select"
        >
          <option value="">All Departments</option>
          <option value="engineering">Engineering</option>
          <option value="design">Design</option>
          <option value="marketing">Marketing</option>
          <option value="sales">Sales</option>
          <option value="hr">Human Resources</option>
        </select>

        <button className="btn-refresh" onClick={() => fetchUsers(1)}>
          <i className="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>

      {/* Results count */}
      <p className="results-count">
        Showing {users.length} of {pagination.total} users
      </p>

      {/* Users Grid */}
      {loading ? (
        <div className="users-loading">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-users-slash"></i>
          <p>No users found</p>
        </div>
      ) : (
        <div className="users-grid">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-card-header">
                <div className="user-avatar">
                  {getInitials(user.name)}
                </div>
                <div className="user-header-info">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                </div>
                <span className={`role-badge ${user.role}`}>
                  {user.role}
                </span>
              </div>

              <div className="user-card-body">
                {user.age && (
                  <div className="info-item">
                    <i className="fas fa-calendar"></i>
                    <span>{user.age} years old</span>
                  </div>
                )}
                {user.department && (
                  <div className="info-item">
                    <i className={`fas ${getDepartmentIcon(user.department)}`}></i>
                    <span>{user.department.charAt(0).toUpperCase() + user.department.slice(1)}</span>
                  </div>
                )}
                <div className="info-item">
                  <i className="fas fa-clock"></i>
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>

              <div className="user-card-footer">
                <button 
                  className="btn-edit"
                  onClick={() => handleEditClick(user)}
                  disabled={actionLoading}
                >
                  <i className="fas fa-edit"></i>
                  Edit
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDeleteClick(user.id)}
                  disabled={actionLoading}
                >
                  <i className="fas fa-trash"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.current === 1}
            onClick={() => fetchUsers(pagination.current - 1)}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <span className="page-info">
            Page {pagination.current} of {pagination.pages}
          </span>
          
          <button
            disabled={pagination.current === pagination.pages}
            onClick={() => fetchUsers(pagination.current + 1)}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this user?</p>
              <p className="modal-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={cancelDelete}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm-delete" 
                onClick={confirmDelete}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Deleting...</>
                ) : (
                  <><i className="fas fa-trash"></i> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-dialog edit-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <i className="fas fa-edit"></i>
              <h3>Edit User</h3>
            </div>
            <div className="modal-body">
              <div className="edit-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    placeholder="Full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    placeholder="Email address"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      value={editForm.age}
                      onChange={handleEditChange}
                      placeholder="Age"
                      min="1"
                      max="120"
                    />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select
                      name="department"
                      value={editForm.department}
                      onChange={handleEditChange}
                    >
                      <option value="">Select Department</option>
                      <option value="engineering">Engineering</option>
                      <option value="design">Design</option>
                      <option value="marketing">Marketing</option>
                      <option value="sales">Sales</option>
                      <option value="hr">HR</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={cancelEdit}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-save" 
                onClick={confirmEdit}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                ) : (
                  <><i className="fas fa-save"></i> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
