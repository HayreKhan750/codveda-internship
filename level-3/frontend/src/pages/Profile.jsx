import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Profile.css'

const API_URL = import.meta.env.VITE_SERVER_URL ? `${import.meta.env.VITE_SERVER_URL}/api` : 'http://localhost:5001/api'

const Profile = () => {
  const { user, updateProfile, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    department: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || '',
        department: user.department || ''
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMessage('')

    const updateData = {
      name: formData.name,
      age: formData.age ? parseInt(formData.age) : undefined,
      department: formData.department
    }

    const result = await updateProfile(updateData)

    if (result.success) {
      setSuccessMessage('Profile updated successfully!')
      setIsEditing(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    }

    setIsSaving(false)
  }

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('') || 'U'
  }

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
            <span className="value">{user?._id}</span>
          </div>
          <div className="info-row">
            <span className="label">Member Since</span>
            <span className="value">
              {new Date(user?.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Account Status</span>
            <span className="value status-active">
              <i className="fas fa-check-circle"></i>
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
