import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import './Profile.css'

const API_URL = 'http://localhost:5001/api'

const Profile = () => {
  const { user, updateProfile, error, clearError } = useAuth()
  const [formData, setFormData] = useState({ name: '', age: '', department: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Change password state
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', age: user.age || '', department: user.department || '' })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMessage('')
    const updateData = {
      name: formData.name,
      age: formData.age ? parseInt(formData.age) : undefined,
      department: formData.department,
    }
    const result = await updateProfile(updateData)
    if (result.success) {
      setSuccessMessage('Profile updated successfully!')
      setIsEditing(false)
      setTimeout(() => setSuccessMessage(''), 4000)
    }
    setIsSaving(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwError(''); setPwSuccess('')
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwError('New passwords do not match'); return
    }
    if (pwData.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters'); return
    }
    setPwLoading(true)
    try {
      await axios.put(`${API_URL}/auth/change-password`, {
        currentPassword: pwData.currentPassword,
        newPassword: pwData.newPassword,
      })
      setPwSuccess('Password changed successfully!')
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPwSuccess(''), 4000)
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password')
    } finally {
      setPwLoading(false)
    }
  }

  const getInitials = (name) =>
    name?.split(' ').map(w => w.charAt(0).toUpperCase()).slice(0, 2).join('') || 'U'

  return (
    <div className="profile-page">

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-large">
          {getInitials(user?.name)}
        </div>
        <div className="profile-title">
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <span className={`role-tag ${user?.role}`}>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </span>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Profile Form */}
      <div className="profile-form-container">
        <div className="form-header">
          <h3>
            <i className="fas fa-user-edit"></i>
            Profile Information
          </h3>
          {!isEditing && (
            <button 
              className="btn-edit-profile"
              onClick={() => setIsEditing(true)}
            >
              <i className="fas fa-pen"></i>
              Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">
                <i className="fas fa-user"></i>
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i>
                Email Address
              </label>
              <input
                type="email"
                id="email-display"
                value={user?.email}
                disabled
                className="disabled"
              />
              <span className="helper-text">Email cannot be changed</span>
            </div>

            <div className="form-group">
              <label htmlFor="age">
                <i className="fas fa-calendar"></i>
                Age
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                disabled={!isEditing}
                min="1"
                max="120"
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">
                <i className="fas fa-building"></i>
                Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">Select Department</option>
                <option value="engineering">Engineering</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="hr">Human Resources</option>
              </select>
            </div>
          </div>

          {isEditing && (
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    name: user?.name || '',
                    age: user?.age || '',
                    department: user?.department || ''
                  })
                  clearError()
                }}
                disabled={isSaving}
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-small"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Account Info */}
      <div className="account-info">
        <h3>
          <i className="fas fa-info-circle"></i>
          Account Information
        </h3>
        <div className="info-grid">
          <div className="info-row">
            <span className="label">Account ID</span>
            <span className="value" style={{ fontFamily: 'monospace', fontSize: 12 }}>{user?._id || user?.id}</span>
          </div>
          <div className="info-row">
            <span className="label">Member Since</span>
            <span className="value">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Account Status</span>
            <span className="value status-active"><i className="fas fa-check-circle"></i> Active</span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="account-info" style={{ marginTop: 'var(--spacing-xl)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--spacing-lg)' }}>
          <i className="fas fa-lock"></i> Change Password
        </h3>

        {pwSuccess && (
          <div style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--accent-light)' }}>
            <i className="fas fa-check-circle"></i> {pwSuccess}
          </div>
        )}
        {pwError && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#f87171' }}>
            <i className="fas fa-exclamation-circle"></i> {pwError}
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div className="form-grid">
            <div className="form-group">
              <label className="profile-label" htmlFor="currentPassword"><i className="fas fa-key"></i> Current Password</label>
              <input className="form-input" type="password" id="currentPassword" value={pwData.currentPassword}
                onChange={e => setPwData({ ...pwData, currentPassword: e.target.value })} placeholder="Your current password" required />
            </div>
            <div className="form-group">
              <label className="profile-label" htmlFor="newPassword"><i className="fas fa-lock"></i> New Password</label>
              <input className="form-input" type="password" id="newPassword" value={pwData.newPassword}
                onChange={e => setPwData({ ...pwData, newPassword: e.target.value })} placeholder="Min. 6 characters" required />
            </div>
            <div className="form-group">
              <label className="profile-label" htmlFor="confirmPassword"><i className="fas fa-check-double"></i> Confirm Password</label>
              <input className="form-input" type="password" id="confirmPassword" value={pwData.confirmPassword}
                onChange={e => setPwData({ ...pwData, confirmPassword: e.target.value })} placeholder="Repeat new password" required />
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: 'var(--spacing-md)' }}>
            <button type="submit" className="btn btn-primary" disabled={pwLoading}>
              {pwLoading
                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Changing…</>
                : <><i className="fas fa-lock"></i> Change Password</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile

