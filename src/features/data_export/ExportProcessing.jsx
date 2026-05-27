import React from 'react'

export default function ExportProcessing({ setViewMode, summaryCard, openConfigForFormat, loading = false, message = '' }) {
  return (
    <div className="module-grid export-page export-page--processing">
      <div className="export-breadcrumb">
        <button type="button" className="ghost-button" onClick={() => setViewMode('landing')} style={{ marginRight: '0.5rem' }}>←</button>
        DATA EXPORT &gt; PROCESSING
      </div>
      <section className="section-card" style={{ gridColumn: '1 / 2' }}>
        <div className="section-head">
          <div>
            <h2 className="section-title">Data Export Management</h2>
            <div className="section-subtitle">{loading ? 'Batch export in progress' : 'Export complete'}</div>
          </div>
          <button className="primary-button" type="button" onClick={() => setViewMode('configBatch')}>BATCH EXPORT</button>
        </div>

        <div className="card" style={{ marginTop: '1rem', padding: '1rem', border: '1px solid rgba(15,23,42,0.08)' }}>
          <div className="card-title">{loading ? 'Preparing secure download…' : 'Download status'}</div>
          <p className="help-note" style={{ marginTop: '0.35rem' }}>{message || (loading ? 'The backend is packaging the export and the download will start automatically.' : 'The export file has been downloaded successfully.')}</p>
        </div>
      </section>

      <aside className="export-stack" style={{ gridColumn: '2 / 3' }}>
        {summaryCard}
      </aside>
    </div>
  )
}
