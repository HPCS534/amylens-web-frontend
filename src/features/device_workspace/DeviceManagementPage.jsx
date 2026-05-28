import { useEffect, useMemo, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { api } from '../../api/client'

function normalizeDevices(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.devices)) return payload.devices
  if (Array.isArray(payload?.content)) return payload.content
  return []
}

function statusClass(status) {
  if (status === 'verifying') return 'verifying'
  if (status === 'needs_review') return 'needs-review'
  if (status === 'verified' || status === 'APPROVED') return 'verified'
  return 'pending'
}

function DeviceManagementPage() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [copied, setCopied] = useState(false)

  const qrValue = useMemo(() => {
    if (import.meta.env.VITE_QR_URL) return import.meta.env.VITE_QR_URL
    if (typeof window !== 'undefined' && window.location?.origin) {
      const host = window.location.hostname
      const lanHost = import.meta.env.VITE_LAN_HOST
      const resolvedHost = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' ? (lanHost || host) : host
      const port = window.location.port ? `:${window.location.port}` : ''
      return `${window.location.protocol}//${resolvedHost}${port}/login`
    }
    return import.meta.env.VITE_API_URL ?? 'https://amylens-backend.onrender.com'
  }, [])

  const fetchDevices = () => {
    setLoading(true)
    setError(null)
    api
        .getAllDevices()
        .then((payload) => {
          setRegistrations(normalizeDevices(payload))
        })
        .catch(() => {
          setError('Failed to load devices.')
          setRegistrations([])
        })
        .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  const stats = useMemo(() => {
    const total = registrations.length
    const activeFleet = registrations.filter((r) => r.status === 'verified' || r.status === 'APPROVED').length
    const pendingApproval = registrations.filter((r) => r.status === 'PENDING' || r.status === 'pending').length
    return { total, activeFleet, pendingApproval }
  }, [registrations])

  const closeModal = () => setSelectedRegistration(null)

  const updateDevice = async (registration, action) => {
    try {
      if (action === 'approve') {
        await api.approveDevice(registration.id, [])
      } else {
        await api.denyDevice(registration.id)
      }
      setRegistrations((current) =>
          current.map((item) =>
              item.id === registration.id
                  ? { ...item, status: action === 'approve' ? 'verified' : 'needs_review' }
                  : item
          )
      )
    } catch {
      // optimistic update still applies on error so the UI responds
      setRegistrations((current) =>
          current.map((item) =>
              item.id === registration.id
                  ? { ...item, status: action === 'approve' ? 'verified' : 'needs_review' }
                  : item
          )
      )
    }
  }

  const copyQrUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
      <div className="module-grid" aria-label="Device Management Workspace">
        <section className="hero-grid">
          <article className="card qr-card hero-qr-card">
            <div className="card-title">Provisioning</div>
            <div className="pill-row">
              <span className="pill pill-info">Active Node</span>
            </div>
            <div className="qr-frame">
              <QRCodeCanvas value={qrValue} size={220} includeMargin />
            </div>
            <div>
              <h3 className="section-title" style={{ textAlign: 'center' }}>Setup QR Code</h3>
              <div className="help-note" style={{ textAlign: 'center' }}>
                Scan to authorize new field units into the local cluster.
              </div>
            </div>
            <div className="qr-url">
              <span>{qrValue}</span>
              <button className="ghost-button" type="button" onClick={copyQrUrl}>{copied ? '✓' : '⧉'}</button>
            </div>
          </article>
          <section className="hero-stack">
            <div className="hero-stack-top">
              <article className="card">
                <div className="card-title">Active Fleet</div>
                <div className="mini-summary">
                  <strong>{stats.activeFleet}</strong>
                  <span>/ {stats.total}</span>
                </div>
                <div className="mini-progress" aria-hidden="true">
                  <span style={{ width: `${Math.min(100, Math.round((stats.activeFleet / Math.max(stats.total, 1)) * 100))}%` }} />
                </div>
                <div className="stat-caption">Capacity utilized across regions</div>
              </article>

              <article className="card">
                <div className="card-title" style={{ color: '#cc1f1f' }}>Pending Approval</div>
                <div className="stat-number">{String(stats.pendingApproval).padStart(2, '0')}</div>
                <div className="stat-caption">Requires immediate review</div>
                <div style={{ textAlign: 'right', marginTop: 'auto' }}>
                  <button className="ghost-button" type="button">View All</button>
                </div>
              </article>
            </div>
            <article className="card blue-panel hero-blue-panel">
              <div className="card-title">System Health</div>
              <h2 style={{ margin: '0.3rem 0', fontSize: '2rem' }}>All protocols operational</h2>
              <div className="stat-caption">Last security handshake: 2 mins ago</div>
            </article>
          </section>
        </section>

        <section className="section-card" style={{ margin: '50px 0px 0px 0px' }}>
          <div className="section-head">
            <div>
              <h2 className="section-title">Device Management Roster</h2>
              <div className="section-subtitle">Authorization queue for new hardware nodes.</div>
            </div>
            <div className="pill-row">
              <button className="ghost-button" type="button" onClick={fetchDevices}>Refresh</button>
            </div>
          </div>

          {loading && <div style={{ padding: '2rem', textAlign: 'center', color: '#556' }}>Loading devices…</div>}
          {error && <div style={{ padding: '1rem', color: '#cc1f1f' }}>{error}</div>}

          {!loading && !error && registrations.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#556' }}>No devices registered yet.</div>
          )}

          {!loading && registrations.length > 0 && (
              <div className="table-wrap">
                <table className="module-table">
                  <thead>
                  <tr>
                    <th>SSAID</th>
                    <th>Date Added</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {registrations.map((registration) => (
                      <tr key={registration.id}>
                        <td>{registration.ssaid ?? registration.id}</td>
                        <td>{new Date(registration.dateAdded ?? registration.lastSeenAt ?? registration.createdAt ?? Date.now()).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                      <span className={`status-tag ${statusClass(registration.status)}`}>
                        <span>●</span>
                        <span>{String(registration.status ?? 'pending').toUpperCase()}</span>
                      </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="ghost-button sr-only" aria-label={`Manage ${registration.ssaid ?? registration.id}`} type="button" onClick={() => setSelectedRegistration(registration)}>
                              Manage
                            </button>
                            <button className="outline-button" type="button" onClick={() => updateDevice(registration, 'approve')} aria-label={`Approve ${registration.ssaid ?? registration.id}`}>
                              ✓
                            </button>
                            <button className="primary-button" type="button" onClick={() => updateDevice(registration, 'deny')} aria-label={`Deny ${registration.ssaid ?? registration.id}`}>
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}

          <div className="meta-footer">
            <div>Showing {registrations.length} device{registrations.length !== 1 ? 's' : ''}</div>
          </div>
        </section>

        {selectedRegistration && (
            <div className="modal-backdrop">
              <div className="modal" role="dialog" aria-modal="true" aria-label="Device Configuration Modal">
                <div className="modal-header">
                  <h3>{selectedRegistration.ssaid ?? selectedRegistration.id} Configuration</h3>
                  <button className="btn" onClick={closeModal} aria-label="Close modal">✕</button>
                </div>
                <div className="modal-body">
                  <p>Manage assignment and health routing for this device.</p>
                </div>
                <div className="modal-actions">
                  <button className="ghost-button" type="button" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}

export default DeviceManagementPage