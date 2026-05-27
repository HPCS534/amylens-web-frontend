import React from 'react'

export default function ExportLanding({ setViewMode, summaryCard }) {
  return (
    <div className="module-grid export-page export-page--landing">
      <div className="export-breadcrumb">DATA EXPORT &gt; BATCH EXPORT</div>
      <section className="section-card" style={{ gridColumn: '1 / 2' }}>
        <div className="card blue-panel" style={{ padding: '2rem' }}>
          <div className="card-title" style={{ color: '#ffffff' }}>SYSTEM LEVEL BATCH</div>
          <h2 style={{ marginTop: '0.5rem', color: '#ffffff' }}>Batch Data Export</h2>
          <p style={{ color: '#ffffff', marginTop: '0.75rem' }}>Generate a standardized export of session records using the 14-column GQ-RIS schema.</p>
          <button className="outline-button" type="button" style={{ marginTop: '1rem' }} onClick={() => setViewMode('configBatch')}>Configure Batch Export</button>
        </div>
      </section>

      <aside className="export-stack" style={{ gridColumn: '2 / 3' }}>
        {summaryCard}
      </aside>
    </div>
  )
}
