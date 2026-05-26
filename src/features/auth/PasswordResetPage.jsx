import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { getDevPassword, markPasswordResetCompleted, setDevPassword } from './passwordResetState'
import './LoginPage.css'
import './PasswordResetPage.css'

export default function PasswordResetPage() {
  const navigate = useNavigate()
  const isDev = import.meta.env.DEV
  const [currentPassword, setCurrentPassword] = useState(isDev ? 'test' : '')
  const [newPassword, setNewPassword] = useState(isDev ? 'testest1!' : '')
  const [confirmPassword, setConfirmPassword] = useState(isDev ? 'testest1!' : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }

    setLoading(true)
    try {
      try {
        await api.resetPassword(currentPassword, newPassword)
      } catch (error) {
        if (!import.meta.env.DEV) {
          throw error
        }

        if (currentPassword !== getDevPassword()) {
          throw new Error('Current password is incorrect.')
        }
      }

      setDevPassword(newPassword)
      markPasswordResetCompleted()
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.body || err.message || 'Password reset failed.')
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
              {loading ? 'Updating…' : 'Update Password & Continue →'}
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
