import { useMemo, useState } from 'react'
import { api } from '../../api/client'

const exportTypes = [
  { key: 'csv', title: 'CSV', description: '14-column GQ-RIS schema' },
  { key: 'json', title: 'JSON', description: 'Structured payload for integrations' },
  { key: 'pdf', title: 'PDF', description: 'One-session printable report' },
]

export default function ExportPage() {
  const [format, setFormat] = useState('csv')
  const [status, setStatus] = useState('verified')
  const [variety, setVariety] = useState('all')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const exportLabel = useMemo(() => exportTypes.find((entry) => entry.key === format)?.title ?? 'Export', [format])

  const download = async () => {
    setLoading(true)
    setMessage('Processing export request…')
    try {
      const blob = await api.exportSessions({ format, status: status === 'all' ? undefined : status, variety: variety === 'all' ? undefined : variety })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `amylens-export.${format}`
      anchor.click()
      URL.revokeObjectURL(url)
      setMessage(`Exported ${exportLabel} successfully.`)
    } catch (error) {
      setMessage(error.message || 'Export failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="module-grid">
      <section className="section-card">
        <div className="section-head">
          <div>
            <h2 className="section-title">Standardized Data Export</h2>
            <div className="section-subtitle">Generate CSV, JSON, or PDF from session records</div>
          </div>
          <button className="primary-button" type="button" onClick={download} disabled={loading}>
            {loading ? 'Processing…' : `Generate ${exportLabel}`}
          </button>
        </div>

        <div className="export-options">
          {exportTypes.map((entry) => (
            <button key={entry.key} type="button" className={`export-option ${format === entry.key ? 'active' : ''}`} onClick={() => setFormat(entry.key)}>
              <div className="card-title">{entry.title}</div>
              <p className="help-note">{entry.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="hero-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <article className="card">
          <div className="card-title">Filter by status</div>
          <div className="field-group">
            <label htmlFor="status">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="verified">Verified</option>
              <option value="needs_review">Needs Review</option>
              <option value="all">All</option>
            </select>
          </div>
        </article>
        <article className="card">
          <div className="card-title">Filter by variety</div>
          <div className="field-group">
            <label htmlFor="variety">Variety</label>
            <select id="variety" value={variety} onChange={(e) => setVariety(e.target.value)}>
              <option value="all">All varieties</option>
              <option value="IR64">IR64</option>
              <option value="Samba">Samba</option>
              <option value="Tenera">Tenera</option>
            </select>
          </div>
        </article>
        <article className="card">
          <div className="card-title">Processing state</div>
          <div className="help-note">{message || 'Ready to export records.'}</div>
        </article>
      </section>
    </div>
  )
}
