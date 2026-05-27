import React from 'react'

export default function ExportLanding({ setViewMode, summaryCard }) {
  return (
    <div className="module-grid export-page export-page--landing">
      <div className="export-breadcrumb">DATA EXPORT &gt; BATCH EXPORT CONFIGURATION</div>
      <section className="section-card" style={{ gridColumn: '1 / 2' }}>
        <div className="card blue-panel" style={{ padding: '2rem' }}>
          <div className="card-title" style={{ color: '#ffffff' }}>SYSTEM LEVEL BATCH</div>
          <h2 style={{ marginTop: '0.5rem', color: '#ffffff' }}>Batch Data Export</h2>
          <p style={{ color: '#ffffff', marginTop: '0.75rem' }}>Generate a comprehensive dataset utilizing the 14-column GQ-RIS schema. This export includes all reconciled device telemetry, session identifiers, and proprietary analytics metadata.</p>
          <button className="outline-button" type="button" style={{ marginTop: '1rem' }} onClick={() => setViewMode('processing')}>Download All Active Sessions</button>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <h3>Single-Session Exports</h3>
          <div className="table-wrap">
            <table className="module-table">
              <thead>
                <tr><th>SESSION ID</th><th>VARIETY</th><th>DATE</th><th>EXPORT FORMATS</th></tr>
              </thead>
              <tbody>
                <tr><td><strong style={{ color: '#2149b7' }}>SES-992-01A</strong></td><td>Standard Hybrid</td><td>Oct 24, 2023</td><td>PDF • JSON • CSV</td></tr>
                <tr><td><strong style={{ color: '#2149b7' }}>SES-992-02X</strong></td><td>Experimental Beta</td><td>Oct 23, 2023</td><td>PDF • JSON • CSV</td></tr>
                <tr><td><strong style={{ color: '#2149b7' }}>SES-988-14B</strong></td><td>Standard Hybrid</td><td>Oct 22, 2023</td><td>PDF • JSON • CSV</td></tr>
                <tr><td><strong style={{ color: '#2149b7' }}>SES-985-09L</strong></td><td>Legacy Data</td><td>Oct 20, 2023</td><td>PDF • JSON • CSV</td></tr>
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
          <div style={{ marginTop: '1rem' }}>
            <button className="ghost-button" type="button">Audit ID: NX-9982-BA</button>
          </div>
        </div>
      </aside>
    </div>
  )
}
