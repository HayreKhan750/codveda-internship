import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login, error, clearError } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const result = await login(formData.email, formData.password)
    if (result.success) navigate('/dashboard')
    setIsLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <i className="fas fa-database"></i>
          <span>Codveda</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', color: 'white', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>Level 2</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#f87171' }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <i className="fas fa-envelope"></i> Email Address
            </label>
            <input
              className="form-input"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              <i className="fas fa-lock"></i> Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                autoComplete="current-password"
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, transition: 'var(--transition)' }}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
            style={{ marginTop: 8 }}
          >
            {isLoading ? (
              <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Signing in…</>
            ) : (
              <><i className="fas fa-sign-in-alt"></i> Sign In</>
            )}
          </button>
        </form>

        {/* Hint */}
        <div style={{ marginTop: 'var(--spacing-xl)', padding: '12px 16px', background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.2)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-muted)' }}>
          <i className="fas fa-info-circle" style={{ color: 'var(--primary-light)', marginRight: 6 }}></i>
          Seeded admin: <strong style={{ color: 'var(--primary-light)' }}>admin@codveda.io</strong> / <strong style={{ color: 'var(--primary-light)' }}>Admin@123</strong>
        </div>

        <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', fontSize: 13, color: 'var(--text-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
