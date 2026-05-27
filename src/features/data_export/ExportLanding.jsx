import React, { useEffect, useState } from 'react'
import { api } from '../../api/client'

export default function ExportLanding({ setViewMode, summaryCard }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api.getSessions().then((data) => {
      if (!mounted) return
      setSessions(Array.isArray(data) ? data : [])
    }).catch(() => {
      if (!mounted) return
      setSessions([])
    }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const downloadSession = async (id, format = 'csv') => {
    try {
      const blob = await api.exportSession(id, format)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `amylens-session-${id}.${format}`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert('Download failed: ' + (err.message || ''))
    }
  }

  return (
    <div className="module-grid export-page export-page--landing">
      <div className="export-breadcrumb">DATA EXPORT &gt; BATCH EXPORT</div>
      <section className="section-card" style={{ gridColumn: '1 / 2' }}>
        <div className="card blue-panel" style={{ padding: '2rem' }}>
          <div className="card-title" style={{ color: '#ffffff' }}>SYSTEM LEVEL BATCH</div>
          <h2 style={{ marginTop: '0.5rem', color: '#ffffff' }}>Batch Data Export</h2>
          <p style={{ color: '#ffffff', marginTop: '0.75rem' }}>Generate a comprehensive dataset utilizing the 14-column GQ-RIS schema. This export includes all reconciled device telemetry, session identifiers, and proprietary analytics metadata.</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button className="primary-button" type="button" onClick={() => setViewMode('configBatch')}>Download All Active Sessions</button>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem' }}>
          <div className="card" style={{ padding: '1rem' }}>
            <div className="card-title">Single-Session Exports</div>
            <div className="help-note" style={{ marginTop: '0.5rem' }}>Download individual session records as PDF, JSON, or CSV.</div>
            <div style={{ marginTop: '1rem' }}>
              {loading ? <div>Loading sessions…</div> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #e6e6e6' }}>
                      <th style={{ padding: '0.5rem' }}>SESSION ID</th>
                      <th style={{ padding: '0.5rem' }}>VARIETY</th>
                      <th style={{ padding: '0.5rem' }}>DATE</th>
                      <th style={{ padding: '0.5rem' }}>EXPORT FORMATS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.length === 0 && (
                      <tr><td colSpan={4} style={{ padding: '0.75rem' }}>No sessions available.</td></tr>
                    )}
                    {sessions.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f3f3f3' }}>
                        <td style={{ padding: '0.5rem' }}>{s.id}</td>
                        <td style={{ padding: '0.5rem' }}>{s.variety || '—'}</td>
                        <td style={{ padding: '0.5rem' }}>{s.capturedAt ? new Date(s.capturedAt).toLocaleDateString() : '—'}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <button className="ghost-button" style={{ marginRight: '0.5rem' }} onClick={() => downloadSession(s.id, 'pdf')}>PDF</button>
                          <button className="ghost-button" style={{ marginRight: '0.5rem' }} onClick={() => downloadSession(s.id, 'json')}>JSON</button>
                          <button className="ghost-button" onClick={() => downloadSession(s.id, 'csv')}>CSV</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </section>

      <aside className="export-stack" style={{ gridColumn: '2 / 3' }}>
        {summaryCard}
      </aside>
    </div>
  )
}
