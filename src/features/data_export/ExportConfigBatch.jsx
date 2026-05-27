import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function ExportConfig(props) {
  const {
    setViewMode,
    summaryCard,
    exportTypes,
    format,
    setFormat,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    variety,
    setVariety,
    download,
  } = props

  const navigate = useNavigate()

  return (
    <div className="module-grid export-page export-page--config">
      <div className="export-breadcrumb"><button type="button" className="ghost-button" onClick={() => navigate(-1)} style={{ marginRight: '0.5rem' }}>←</button>REPORTS &gt; EXPORTS</div>
      <section className="section-card" style={{ gridColumn: '1 / 2' }}>
        <div className="card-title">Configure Batch Export</div>
        <p className="help-note">Define the parameters for your institutional data aggregate. Processing occurs in a secure isolated environment.</p>

        <div style={{ marginTop: '1rem' }}>
          <div className="card" style={{ padding: '1rem' }}>
            <div className="card-title">EXPORT FORMAT</div>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
              {exportTypes.map((entry) => (
                <button key={entry.key} type="button" className={`export-option ${format === entry.key ? 'active' : ''}`} onClick={() => setFormat(entry.key)}>
                  <div className="card-title">{entry.title}</div>
                  <p className="help-note">{entry.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label htmlFor="dateFrom">Start Date</label>
              <input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label htmlFor="dateTo">End Date</label>
              <input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div className="card export-criteria-card" style={{ padding: '1rem' }}>
              <div className="card-title">Record Selection Criteria</div>
              <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}>
                <label><input type="radio" name="criteria" defaultChecked /> All Reconciled Sessions</label>
                <label><input type="radio" name="criteria" /> Flagged Sessions Only</label>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
            <button className="ghost-button" type="button" onClick={() => setViewMode('landing')}>Cancel</button>
            <button className="outline-button" type="button" onClick={async () => { await download(); setViewMode('processing') }}>Start Processing</button>
          </div>
        </div>
      </section>

      <aside className="export-stack" style={{ gridColumn: '2 / 3' }}>
        {summaryCard}
      </aside>
    </div>
  )
}
