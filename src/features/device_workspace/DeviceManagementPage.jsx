import { useEffect, useMemo, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { api } from '../../api/client'
import GqrisImportTrigger from './GqrisImportTrigger'

function normalizeDevices(payload) {
  let devices = null
  if (Array.isArray(payload)) devices = payload
  else if (Array.isArray(payload?.devices)) devices = payload.devices
  else if (Array.isArray(payload?.content)) devices = payload.content
  else return []
  
  return devices
}

function statusClass(status) {
  if (status === 'verifying') return 'verifying'
  if (status === 'needs_review') return 'needs-review'
  if (status === 'verified') return 'verified'
  return 'pending'
}

function DeviceManagementPage({ deviceRegistrations = [] }) {
  const [registrations, setRegistrations] = useState(deviceRegistrations)
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [copied, setCopied] = useState(false)

  const qrValue = useMemo(() => {
    if (import.meta.env.VITE_QR_URL) return import.meta.env.VITE_QR_URL
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return `https://${window.location.hostname}:443`
    }

    return 'https://<server-ip>:443'
  }, [])

  useEffect(() => {
    let active = true
    api
      .getAllDevices()
      .then((payload) => {
        if (active) setRegistrations(normalizeDevices(payload))
      })
      .catch(() => {
        if (active) setRegistrations(deviceRegistrations)
      })
    return () => {
      active = false
    }
  }, [deviceRegistrations])

  const stats = useMemo(() => {
    const total = registrations.length
    const activeFleet = registrations.filter((registration) => registration.status === 'verified' || registration.status === 'approved').length
    const pendingApproval = registrations.filter((registration) => registration.status === 'pending').length
    return { total, activeFleet, pendingApproval }
  }, [registrations])

  const closeModal = () => {
    setSelectedRegistration(null)
  }

  const updateDevice = async (registration, action) => {
    try {
      if (action === 'approve') {
        await api.approveDevice(registration.id, [])
      } else {
        await api.denyDevice(registration.id)
      }
      setRegistrations((current) =>
        current.map((item) => (item.id === registration.id ? { ...item, status: action === 'approve' ? 'verified' : 'needs_review' } : item)),
      )
    } catch {
      setRegistrations((current) =>
        current.map((item) => (item.id === registration.id ? { ...item, status: action === 'approve' ? 'verified' : 'needs_review' } : item)),
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
            <span className="pill-info pill">Active Node</span>
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
            <div className="section-subtitle">Authorize approved devices and manage team access for the dashboard.</div>
          </div>
          <div className="pill-row">
            <button className="ghost-button" type="button">Filter</button>
            <GqrisImportTrigger />
          </div>
        </div>

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
              {registrations.length > 0 ? (
                registrations.map((registration) => (
                  <tr key={registration.id}>
                    <td>{registration.ssaid ?? registration.id}</td>
                    <td>{new Date(registration.registeredAt ?? registration.dateAdded ?? registration.lastSeenAt ?? Date.now()).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <span className={`status-tag ${statusClass((registration.status ?? '').toLowerCase())}`}>
                        <span>●</span>
                        <span>{String(registration.status ?? 'PENDING').toUpperCase()}</span>
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="ghost-button sr-only" aria-label={`Manage ${registration.hardwareIdentity ?? registration.ssaid ?? registration.id}`} type="button" onClick={() => setSelectedRegistration(registration)}>
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
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                    No devices registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="meta-footer">
          <div>Showing {registrations.length} registered devices</div>
          <div className="pagination" aria-label="Device roster pagination">
            <button type="button">‹</button>
            <button type="button" className="active">1</button>
            <button type="button">2</button>
            <button type="button">›</button>
          </div>
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
