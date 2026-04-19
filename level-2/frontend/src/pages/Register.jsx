import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const passwordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const map = [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Weak', color: '#ef4444' },
    { score: 2, label: 'Fair', color: '#f59e0b' },
    { score: 3, label: 'Good', color: '#10b981' },
    { score: 4, label: 'Strong', color: '#10b981' },
    { score: 5, label: 'Very Strong', color: '#6ee7b7' },
  ]
  return map[Math.min(score, 5)]
}

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', age: '', department: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register, error, clearError } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const result = await register({
      ...formData,
      age: formData.age ? parseInt(formData.age) : undefined,
    })
    if (result.success) navigate('/dashboard')
    setIsLoading(false)
  }

  const strength = passwordStrength(formData.password)

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">
          <i className="fas fa-database"></i>
          <span>Codveda</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--primary),var(--primary-light))', color: 'white', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>Level 2</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join Codveda — fill in your details below</p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#f87171' }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                <i className="fas fa-user"></i> Full Name
              </label>
              <input className="form-input" type="text" id="name" name="name"
                value={formData.name} onChange={handleChange}
                placeholder="John Smith" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="age">
                <i className="fas fa-calendar"></i> Age
              </label>
              <input className="form-input" type="number" id="age" name="age"
                value={formData.age} onChange={handleChange}
                placeholder="25" min="1" max="120" />
              <span className="form-helper">Optional</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <i className="fas fa-envelope"></i> Email Address
            </label>
            <input className="form-input" type="email" id="email" name="email"
              value={formData.email} onChange={handleChange}
              placeholder="you@example.com" autoComplete="email" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="department">
                <i className="fas fa-building"></i> Department
              </label>
              <select className="form-select" id="department" name="department"
                value={formData.department} onChange={handleChange}>
                <option value="">Select…</option>
                <option value="engineering">Engineering</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="hr">Human Resources</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                <i className="fas fa-lock"></i> Password
              </label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPassword ? 'text' : 'password'}
                  id="password" name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="Min. 6 chars" minLength="6" required
                  style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {formData.password && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
                    {[1,2,3,4,5].map(n => (
                      <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= strength.score ? strength.color : 'var(--bg-tertiary)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  {strength.label && <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label}</span>}
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full"
            disabled={isLoading} style={{ marginTop: 8 }}>
            {isLoading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Creating account…</>
              : <><i className="fas fa-user-plus"></i> Create Account</>
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
