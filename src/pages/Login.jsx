import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const DEMO_CREDS = [
  { role: 'admin', username: 'admin', password: 'admin123', description: 'Full access' },
  { role: 'user',  username: 'user',  password: 'user123',  description: 'View only' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim() || !form.password.trim()) {
      setError('Please enter both username and password.')
      return
    }
    setLoading(true)
    try {
      const user = login(form.username.trim(), form.password)
      navigate(user.role === 'admin' ? '/dashboard' : '/products', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (cred) => {
    setForm({ username: cred.username, password: cred.password })
  }

  return (
    <div className="login-page">
      <div className="login-bg-glow glow-1" />
      <div className="login-bg-glow glow-2" />

      <div className="login-card" role="main" aria-label="Login form">
        {/* Logo */}
        <div className="login-logo">
        
          <span className="login-logo-text">AdminPulse</span>
        </div>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to your dashboard</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              name="username"
              type="text"
              className={`form-input ${error ? 'error' : ''}`}
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              className={`form-input ${error ? 'error' : ''}`}
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="current-password"
            />
            {error && <p className="form-error" role="alert">{error}</p>}
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="demo-credentials">
          <h4>Demo Accounts</h4>
          {DEMO_CREDS.map((cred) => (
            <div key={cred.role} className="demo-cred-row">
              <span className="demo-cred-role">
                {cred.role}
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
                  ({cred.description})
                </span>
              </span>
              <button
                className="demo-cred-btn"
                onClick={() => handleDemoLogin(cred)}
                id={`demo-${cred.role}`}
                type="button"
              >
                Use
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
