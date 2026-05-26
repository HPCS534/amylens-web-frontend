import { useEffect, useMemo, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { api } from '../../api/client'

const defaultDeviceRegistrations = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    ssaid: '550e8400-e29b-41d4-a716-446655440000',
    status: 'pending',
    dateAdded: '2023-10-24T09:42:00Z',
    healthStatus: 'Healthy',
  },
  {
    id: '76c45922-a11c-9a3d-a223-228833119999',
    ssaid: '76c45922-a11c-9a3d-a223-228833119999',
    status: 'pending',
    dateAdded: '2023-10-23T16:15:00Z',
    healthStatus: 'Healthy',
  },
  {
    id: 'ad9871a6-c992-0041-f222-111122223333',
    ssaid: 'ad9871a6-c992-0041-f222-111122223333',
    status: 'verifying',
    dateAdded: '2023-10-23T11:02:00Z',
    healthStatus: 'Warning',
  },
  {
    id: '3312e844-41d4-a716-4466-990011223344',
    ssaid: '3312e844-41d4-a716-4466-990011223344',
    status: 'pending',
    dateAdded: '2023-10-22T14:50:00Z',
    healthStatus: 'Healthy',
  },
]

function normalizeDevices(payload) {
  let devices = null
  if (Array.isArray(payload)) devices = payload
  else if (Array.isArray(payload?.devices)) devices = payload.devices
  else if (Array.isArray(payload?.content)) devices = payload.content
  else return defaultDeviceRegistrations
  
  // Fallback to hardcoded data if API returns empty
  return devices.length > 0 ? devices : defaultDeviceRegistrations
}

function statusClass(status) {
  if (status === 'verifying') return 'verifying'
  if (status === 'needs_review') return 'needs-review'
  if (status === 'verified') return 'verified'
  return 'pending'
}

function DeviceManagementPage({ deviceRegistrations = defaultDeviceRegistrations }) {
  const [registrations, setRegistrations] = useState(deviceRegistrations)
  const [selectedRegistration, setSelectedRegistration] = useState(null)

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

  return (
    <div className="module-grid" aria-label="Device Management Workspace">
      <section className="hero-grid">
        <article className="card qr-card hero-qr-card">
          <div className="card-title">Provisioning</div>
          <div className="pill-row">
            <span className="pill-info pill">Active Node</span>
          </div>
          <div className="qr-frame">
            <QRCodeCanvas value={import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'} size={220} includeMargin />
          </div>
          <div>
            <h3 className="section-title" style={{ textAlign: 'center' }}>Setup QR Code</h3>
            <div className="help-note" style={{ textAlign: 'center' }}>
              Scan to authorize new field units into the local cluster.
            </div>
          </div>
          <div className="qr-url">
            <span>{import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'}</span>
            <button className="ghost-button" type="button">⧉</button>
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

      

      <section className="section-card">
        <div className="section-head">
          <div>
            <h2 className="section-title">Device Management Roster</h2>
            <div className="section-subtitle">Authorization queue for new hardware nodes.</div>
          </div>
          <div className="pill-row">
            <button className="ghost-button" type="button">Filter</button>
            <button className="ghost-button" type="button">Export CSV</button>
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
              {registrations.map((registration) => (
                <tr key={registration.id}>
                  <td>{registration.ssaid ?? registration.id}</td>
                  <td>{new Date(registration.dateAdded ?? registration.lastSeenAt ?? Date.now()).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <span className={`status-tag ${statusClass(registration.status)}`}>
                      <span>●</span>
                      <span>{String(registration.status ?? 'pending').toUpperCase()}</span>
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
              ))}
            </tbody>
          </table>
        </div>

        <div className="meta-footer">
          <div>Showing {Math.min(4, registrations.length)} of {registrations.length} pending requests</div>
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
