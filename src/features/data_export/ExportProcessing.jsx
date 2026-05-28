import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'

export default function ExportProcessing({ setViewMode, summaryCard, openConfigForFormat, sessionCount }) {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
        .getSessions()
        .then((data) => {
          const arr = Array.isArray(data) ? data : (data?.content ?? [])
          setSessions(arr)
        })
        .catch(() => setSessions([]))
        .finally(() => setLoading(false))
  }, [])

  return (
      <div className="module-grid export-page export-page--processing">
        <div className="export-breadcrumb">
          <button type="button" className="ghost-button" onClick={() => navigate(-1)} style={{ marginRight: '0.5rem' }}>←</button>
          ADMIN &gt; DATA EXPORT
        </div>
        <section className="section-card" style={{ gridColumn: '1 / 2' }}>
          <div className="section-head">
            <div>
              <h2 className="section-title">Data Export Management</h2>
              <div className="section-subtitle">Export sessions as CSV or JSON</div>
            </div>
            <button className="primary-button" type="button" onClick={() => setViewMode('configBatch')}>BATCH EXPORT</button>
          </div>

          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="card">
              <div className="card-title">TOTAL SESSIONS</div>
              <div className="stat-number">{sessionCount !== null ? sessionCount.toLocaleString() : (loading ? '…' : sessions.length.toLocaleString())}</div>
            </div>
            <div className="card">
              <div className="card-title">AVAILABLE FORMATS</div>
              <div className="stat-number">CSV, JSON</div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <div className="section-head">
              <h3 className="section-title">Recent Sessions</h3>
            </div>
            <div className="table-wrap">
              <table className="module-table">
                <thead>
                <tr>
                  <th>SESSION ID</th>
                  <th>VARIETY</th>
                  <th>SUBMITTED AT</th>
                  <th>VERDICT</th>
                  <th>ACTION</th>
                </tr>
                </thead>
                <tbody>
                {loading && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#556' }}>Loading…</td>
                    </tr>
                )}
                {!loading && sessions.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#556' }}>No sessions found.</td>
                    </tr>
                )}
                {!loading && sessions.slice(0, 10).map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.variety ?? '—'}</td>
                      <td>{s.submittedAt ? new Date(s.submittedAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td>
                      <span style={{ color: s.verdict === 'verified' ? '#1347a8' : s.verdict === 'REJECTED' ? '#ef4444' : '#888' }}>
                        ● {s.verdict ? s.verdict.toUpperCase() : 'PENDING'}
                      </span>
                      </td>
                      <td>
                        <button className="ghost-button" type="button" onClick={() => openConfigForFormat('csv')}>DOWNLOAD</button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="export-stack" style={{ gridColumn: '2 / 3' }}>
          {summaryCard}
        </aside>
      </div>
  )
}