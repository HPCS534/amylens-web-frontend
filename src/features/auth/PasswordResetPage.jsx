import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import '../layout/DashboardShell.css'
import './PasswordResetPage.css'

export default function PasswordResetPage() {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
      await api.resetPassword(currentPassword, newPassword)
      navigate('/login')
    } catch (err) {
      setError(err.body || err.message || 'Password reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="reset-panel">
      <form className="reset-card" onSubmit={submit}>
        <header className="reset-header">
          <div className="reset-header-top">
            <div className="reset-icon">🛡</div>
            <div>
              <h1 className="reset-title">Mandatory Password Reset</h1>
              <p className="reset-subtitle">For security reasons, you must change your default password before accessing the dashboard.</p>
            </div>
          </div>
        </header>

        <div className="reset-body">
          <div className="field-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="field-group">
            <label htmlFor="newPassword">New Password</label>
            <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="field-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
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
            <button className="ghost-button" type="button" onClick={() => navigate('/login')}>
              Cancel
            </button>
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Updating…' : 'Update Password & Continue →'}
            </button>
          </div>
        </div>

        <footer className="reset-footer">
          <div className="reset-brand">
            <div className="reset-brand-mark">🔒</div>
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
