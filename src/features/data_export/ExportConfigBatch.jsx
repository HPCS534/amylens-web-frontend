import React from 'react'

export default function ExportConfig(props) {
  const {
    setViewMode,
    summaryCard,
    exportTypes,
    format,
    setFormat,
    status,
    setStatus,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    variety,
    setVariety,
    download,
  } = props

  return (
    <div className="module-grid export-page export-page--config">
      <div className="export-breadcrumb">
        <button type="button" className="ghost-button" onClick={() => setViewMode('landing')} style={{ marginRight: '0.5rem' }}>←</button>
        DATA EXPORT &gt; BATCH EXPORT CONFIGURATION
      </div>
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

          <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label htmlFor="status">Session Status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="verified">Verified</option>
                <option value="needs_review">Needs Review</option>
                <option value="all">All</option>
              </select>
            </div>
            <div>
              <label htmlFor="variety">Variety</label>
              <select id="variety" value={variety} onChange={(e) => setVariety(e.target.value)}>
                <option value="all">All</option>
                <option value="IR64">IR64</option>
                <option value="IRRI-9">IRRI-9</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <p className="help-note">Batch exports apply the selected filters and return a single standardized file.</p>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
            <button className="ghost-button" type="button" onClick={() => setViewMode('landing')}>Cancel</button>
            <button className="outline-button" type="button" onClick={async () => { await download(); setViewMode('processing') }}>Generate Export</button>
          </div>
        </div>
      </section>

      <aside className="export-stack" style={{ gridColumn: '2 / 3' }}>
        {summaryCard}
      </aside>
    </div>
  )
}
