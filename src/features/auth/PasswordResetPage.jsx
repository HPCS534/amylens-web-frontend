import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api, login as apiLogin } from '../../api/client'
import { clearPasswordResetRequired } from './passwordResetState'
import './LoginPage.css'
import './PasswordResetPage.css'

export default function PasswordResetPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState(location.state?.username ?? '')
  const [currentPassword, setCurrentPassword] = useState(location.state?.currentPassword ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Username is required.')
      return
    }

    if (!currentPassword.trim()) {
      setError('Current password is required.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }

    setLoading(true)
    try {
      await apiLogin(username.trim(), currentPassword)
      await api.resetPassword(currentPassword, newPassword)
      clearPasswordResetRequired()
      navigate('/app/devices', { replace: true })
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        setError('The backend rejected the sign-in or reset. Check the username and current password, then retry.')
      } else {
        setError(err.body || err.message || 'Password reset failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-panel reset-panel">
      <form className="auth-card reset-card" onSubmit={submit}>
        <header className="reset-header">
          <div className="reset-header-top">
            <div className="reset-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="reset-icon-svg" role="presentation" focusable="false">
                <path d="M12 2.5 4.5 5.2v5.3c0 4.95 3.17 9.37 7.5 11 4.33-1.63 7.5-6.05 7.5-11V5.2L12 2.5z" fill="currentColor" />
                <path d="M9.7 11.8 11 13.1l3.6-3.6" fill="none" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="auth-title reset-title">Mandatory Password Reset</h1>
              <p className="auth-sub reset-subtitle">For security reasons, you must change your default password before accessing the dashboard.</p>
            </div>
          </div>
        </header>

        <div className="reset-body">
          <div className="field-group">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="field-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input id="currentPassword" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="field-group">
            <label htmlFor="newPassword">New Password</label>
            <input id="newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="field-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          <section className="security-box">
            <h3>Security Requirements</h3>
            <ul>
              <li>At least 8 characters</li>
              <li>Includes a number</li>
              <li>Includes a special character</li>
            </ul>
          </section>

          {error ? <div className="reset-note">⚠ {error}</div> : <div className="reset-note">ℹ Your new password will be applied immediately.</div>}

          <div className="reset-actions">
            <button className="btn-primary reset-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in and updating…' : 'Sign In & Update Password →'}
            </button>
          </div>
        </div>

        <footer className="reset-footer">
          <div className="reset-brand">
            <div className="reset-brand-mark" aria-hidden="true">🔒</div>
            <div>
              <strong>Control Center</strong>
              <span>Secure Access Protocol</span>
            </div>
          </div>
        </footer>
      </form>
    </main>
  )
}
