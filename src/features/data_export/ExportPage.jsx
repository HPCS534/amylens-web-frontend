import { useMemo, useState } from 'react'
import { api } from '../../api/client'
import './ExportPage.css'
import ExportLanding from './ExportLanding'
import ExportProcessing from './ExportProcessing'
import ExportConfig from './ExportConfig'
import ExportConfigBatch from './ExportConfigBatch'

const exportTypes = [
  { key: 'csv', title: 'CSV', description: '14-column GQ-RIS schema' },
  { key: 'json', title: 'JSON', description: 'Structured payload for integrations' },
]

const exportTypesBatch = [
  { key: 'csv', title: 'CSV', description: '14-column GQ-RIS schema' },
]

export default function ExportPage() {
  const [viewMode, setViewMode] = useState('landing')
  const [format, setFormat] = useState('csv')
  const [status, setStatus] = useState('verified')
  const [dateFrom, setDateFrom] = useState('2023-10-01')
  const [dateTo, setDateTo] = useState('2023-12-31')
  const [variety, setVariety] = useState('all')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const exportLabel = useMemo(() => exportTypes.find((entry) => entry.key === format)?.title ?? 'Export', [format])

  const toCsvValue = (value) => {
    if (value == null) return ''
    const text = Array.isArray(value) ? value.join('; ') : value instanceof Date ? value.toISOString() : String(value)
    return `"${text.replace(/"/g, '""')}"`
  }

  const buildCsvFromSessions = (sessions) => {
    const rows = Array.isArray(sessions) ? sessions : []
    const columns = Array.from(
      rows.reduce((set, row) => {
        if (row && typeof row === 'object') {
          Object.keys(row).forEach((key) => set.add(key))
        }
        return set
      }, new Set())
    )

    if (columns.length === 0) return ''

    const header = columns.join(',')
    const body = rows
      .map((row) => columns.map((column) => toCsvValue(row?.[column])).join(','))
      .join('\n')
    return `${header}\n${body}`
  }

  const downloadBatchSessionsCsv = async () => {
    setLoading(true)
    setMessage('Preparing batch CSV export…')
    try {
      const sessions = await api.getSessions()
      const csv = buildCsvFromSessions(Array.isArray(sessions) ? sessions : [])
      if (!csv) throw new Error('No sessions available to export')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'amylens-active-sessions.csv'
      anchor.click()
      URL.revokeObjectURL(url)
      setMessage('Exported all active sessions successfully.')
    } catch (error) {
      setMessage(error.message || 'Export failed.')
    } finally {
      setLoading(false)
    }
  }

  const download = async () => {
    setLoading(true)
    setMessage('Processing export request…')
    try {
      // Try async start (preferred per Use Case 4.5)
      const startResp = await api.startExport({
        format,
        status: status === 'all' ? undefined : status,
        variety: variety === 'all' ? undefined : variety,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })

      // If server returned a job id, poll until ready then download
      if (startResp && typeof startResp === 'object' && startResp.jobId) {
        const jobId = startResp.jobId
        setMessage('Export job started — processing…')
        // Poll status
        let statusResp = null
        for (let i = 0; i < 60; i++) {
          // eslint-disable-next-line no-await-in-loop
          statusResp = await api.getExportStatus(jobId)
          if (statusResp && statusResp.status === 'ready') break
          if (statusResp && statusResp.status === 'failed') throw new Error(statusResp.message || 'Export failed')
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 2000))
        }
        if (!statusResp || statusResp.status !== 'ready') throw new Error('Export did not complete in time')
        const blob = await api.downloadExport(jobId)
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `amylens-export.${format}`
        anchor.click()
        URL.revokeObjectURL(url)
        setMessage(`Exported ${exportLabel} successfully.`)
      } else if (startResp instanceof Blob) {
        // Server returned the file immediately
        const url = URL.createObjectURL(startResp)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `amylens-export.${format}`
        anchor.click()
        URL.revokeObjectURL(url)
        setMessage(`Exported ${exportLabel} successfully.`)
      } else {
        // Fallback: older immediate-export endpoint
        const blob = await api.exportSessions({
          format,
          status: status === 'all' ? undefined : status,
          variety: variety === 'all' ? undefined : variety,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `amylens-export.${format}`
        anchor.click()
        URL.revokeObjectURL(url)
        setMessage(`Exported ${exportLabel} successfully.`)
      }
    } catch (error) {
      setMessage(error.message || 'Export failed.')
    } finally {
      setLoading(false)
    }
  }

  const openConfigForFormat = (fmt) => {
    setFormat(fmt)
    setViewMode('config')
  }

  const summaryCard = (
    <div className="card export-summary-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
      <div className="card-title">EXPORT CONTROL</div>
      <p className="help-note" style={{ marginTop: '0.5rem' }}>Use the controls to export filtered session records through the standard 14-column GQ-RIS schema.</p>
      <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
        <div>Format <strong style={{ float: 'right' }}>{format.toUpperCase()}</strong></div>
        <div>Status <strong style={{ float: 'right' }}>{status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}</strong></div>
        <div>Variety <strong style={{ float: 'right' }}>{variety === 'all' ? 'All' : variety}</strong></div>
      </div>
    </div>
  )
  if (viewMode === 'landing') return <ExportLanding setViewMode={setViewMode} summaryCard={summaryCard} />
  if (viewMode === 'processing') return (
    <ExportProcessing
      setViewMode={setViewMode}
      summaryCard={summaryCard}
      loading={loading}
      message={message}
    />
  )
  if (viewMode === 'configBatch') return (
    <ExportConfigBatch
      setViewMode={setViewMode}
      summaryCard={summaryCard}
      exportTypes={exportTypesBatch}
      format={format}
      setFormat={setFormat}
      status={status}
      setStatus={setStatus}
      dateFrom={dateFrom}
      setDateFrom={setDateFrom}
      dateTo={dateTo}
      setDateTo={setDateTo}
      variety={variety}
      setVariety={setVariety}
      download={downloadBatchSessionsCsv}
    />
  )

  return (
    <ExportConfig
      setViewMode={setViewMode}
      summaryCard={summaryCard}
      exportTypes={exportTypes}
      format={format}
      setFormat={setFormat}
      status={status}
      setStatus={setStatus}
      dateFrom={dateFrom}
      setDateFrom={setDateFrom}
      dateTo={dateTo}
      setDateTo={setDateTo}
      variety={variety}
      setVariety={setVariety}
      download={download}
    />
  )
}
