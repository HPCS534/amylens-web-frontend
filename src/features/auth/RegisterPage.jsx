import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as apiRegister } from '../../api/client'
import './LoginPage.css'

function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await apiRegister(username.trim(), password)
      setSuccess('Account created successfully. Redirecting to login…')
      setTimeout(() => navigate('/login', { replace: true, state: { username: username.trim() } }), 800)
    } catch (err) {
      setError(err?.body || err?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-panel">
      <div className="auth-card">
        <div className="auth-icon">✚</div>
        <h2 className="auth-title">Create Team Lead Account</h2>
        <p className="auth-sub">Register a dashboard account connected to the Module 3 backend.</p>

        <form onSubmit={submit} className="login-form" aria-label="Team Lead Registration Form">
          <label htmlFor="register-username">USERNAME</label>
          <input
              id="register-username"
              name="username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
          />

          <label htmlFor="register-password">PASSWORD</label>
          <input
              id="register-password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
          />

          <label htmlFor="register-confirm-password">CONFIRM PASSWORD</label>
          <input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
          />

          {(error || success) && (
              <div style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: error ? '#b91c1c' : '#166534' }}>
                {error || success}
              </div>
          )}

          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'REGISTER →'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link className="forgot" to="/login">Back to login</Link>
        </div>
      </div>
    </main>
  )
}

export default RegisterPage
