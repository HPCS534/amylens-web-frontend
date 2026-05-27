import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function ExportProcessing({ setViewMode, summaryCard, openConfigForFormat }) {
  const navigate = useNavigate()
  return (
    <div className="module-grid export-page export-page--processing">
      <div className="export-breadcrumb"><button type="button" className="ghost-button" onClick={() => navigate(-1)} style={{ marginRight: '0.5rem' }}>←</button>ADMIN &gt; DATA EXPORT</div>
      <section className="section-card" style={{ gridColumn: '1 / 2' }}>
        <div className="section-head">
          <div>
            <h2 className="section-title">Data Export Management</h2>
            <div className="section-subtitle">Batch export in progress</div>
          </div>
          <button className="primary-button" type="button" onClick={() => setViewMode('configBatch')}>BATCH EXPORT</button>
        </div>

        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div className="card"><div className="card-title">TOTAL EXPORTS</div><div className="stat-number">1,284</div></div>
          <div className="card"><div className="card-title">ACTIVE TRANSFERS</div><div className="stat-number">0</div></div>
          <div className="card"><div className="card-title">AVG PROCESSING TIME</div><div className="stat-number">4.2s</div></div>
          <div className="card"><div className="card-title">SUCCESS RATE</div><div className="stat-number">99.8%</div></div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <div className="section-head">
            <h3 className="section-title">Export History</h3>
            <button className="ghost-button" type="button">Filter</button>
          </div>
          <div className="table-wrap">
            <table className="module-table">
              <thead>
                <tr><th>BATCH ID</th><th>TIMESTAMP</th><th>RECORDS</th><th>SCHEMA</th><th>STATUS</th><th>ACTION</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>EXP-2023-094</td>
                  <td>Oct 24, 2023 14:22</td>
                  <td>1,402</td>
                  <td>GQ-RIS Core</td>
                  <td><span style={{ color: '#1347a8' }}>● COMPLETED</span></td>
                  <td><button className="ghost-button" onClick={() => openConfigForFormat('csv')}>DOWNLOAD</button></td>
                </tr>
                <tr>
                  <td>EXP-2023-093</td>
                  <td>Oct 24, 2023 11:05</td>
                  <td>842</td>
                  <td>Legacy JSON</td>
                  <td><span style={{ color: '#1347a8' }}>● COMPLETED</span></td>
                  <td><button className="ghost-button" onClick={() => openConfigForFormat('json')}>DOWNLOAD</button></td>
                </tr>
                <tr><td>EXP-2023-092</td><td>Oct 23, 2023 09:15</td><td>12,045</td><td>GQ-RIS Core</td><td><span style={{ color: '#ef4444' }}>● FAILED</span></td><td><button className="ghost-button">RETRY</button></td></tr>
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
