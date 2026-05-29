import { useEffect, useState } from 'react'
import { api } from '../../api/client'

export default function ExportLanding({ setViewMode, summaryCard }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
        .getSessions()
        .then((data) => {
          const arr = Array.isArray(data) ? data : (data?.content ?? [])
          // show 5 most recent
          setSessions(arr.slice(0, 5))
        })
        .catch(() => setSessions([]))
        .finally(() => setLoading(false))
  }, [])

  return (
      <div className="module-grid export-page export-page--landing">
        <div className="export-breadcrumb">DATA EXPORT &gt; BATCH EXPORT CONFIGURATION</div>
        <section className="section-card" style={{ gridColumn: '1 / 2' }}>
          <div className="card blue-panel" style={{ padding: '2rem' }}>
            <div className="card-title" style={{ color: '#ffffff' }}>SYSTEM LEVEL BATCH</div>
            <h2 style={{ marginTop: '0.5rem', color: '#ffffff' }}>Batch Data Export</h2>
            <p style={{ color: '#ffffff', marginTop: '0.75rem' }}>
              Generate a comprehensive dataset utilizing the 17-column GQ-RIS schema. This export includes all reconciled
              device telemetry, session identifiers, and proprietary analytics metadata.
            </p>
            <button className="outline-button" type="button" style={{ marginTop: '1rem' }} onClick={() => setViewMode('processing')}>
              Download All Active Sessions
            </button>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3>Recent Sessions</h3>
            <div className="table-wrap">
              <table className="module-table">
                <thead>
                <tr>
                  <th>SESSION ID</th>
                  <th>VARIETY</th>
                  <th>DATE</th>
                  <th>EXPORT FORMATS</th>
                </tr>
                </thead>
                <tbody>
                {loading && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: '#556' }}>Loading sessions…</td>
                    </tr>
                )}
                {!loading && sessions.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: '#556' }}>No sessions available.</td>
                    </tr>
                )}
                {!loading && sessions.map((s) => (
                    <tr key={s.id}>
                      <td><strong style={{ color: '#2149b7' }}>{s.id}</strong></td>
                      <td>{s.variety ?? '—'}</td>
                      <td>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—'}</td>
                      <td>JSON • CSV</td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="export-stack" style={{ gridColumn: '2 / 3' }}>
          {summaryCard}
          <div className="card export-governance-card" style={{ padding: '1.25rem' }}>
            <div className="card-title">Data Governance</div>
            <p className="help-note">This export is governed by the Institutional Data Use Agreement. All actions are logged.</p>
          </div>
        </aside>
      </div>
  )
}