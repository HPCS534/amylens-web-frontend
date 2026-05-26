import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { hasCompletedPasswordReset } from './passwordResetState'
import './LoginPage.css'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await login(username, password)
      if (!hasCompletedPasswordReset()) {
        navigate('/reset-password', { replace: true })
      } else {
        navigate('/app/devices', { replace: true })
      }
    } catch (err) {
      alert('Login failed: ' + (err.message || err))
    }
  }

  return (
    <main className="auth-panel">
      <div className="auth-card">
        <div className="auth-icon">🔒</div>
        <h2 className="auth-title">Team Lead Dashboard</h2>
        <p className="auth-sub">Sign in to manage devices, sessions, and analytics.</p>

        <form onSubmit={submit} className="login-form" aria-label="Team Lead Login Form">
          <label htmlFor="username">USERNAME</label>
          <input id="username" name="username" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="password">PASSWORD</label>
            <Link className="forgot" to="/reset-password">Forgot password?</Link>
          </div>
          <input id="password" name="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'SIGN IN →'}
            </button>
          </div>
        </form>

        
        <div className="footer-links">
          <span>Support</span>
          <span>Legal Policy</span>
        </div>
      </div>
    </main>
  )
}

export default LoginPage
