import { useEffect, useMemo, useState } from 'react'
import { api } from '../../api/client'
import './ExportPage.css'
import ExportLanding from './ExportLanding'
import ExportProcessing from './ExportProcessing'
import ExportConfig from './ExportConfig'
import ExportConfigBatch from './ExportConfigBatch'

const exportTypes = [
  { key: 'csv', title: 'CSV', description: '17-column GQ-RIS schema' },
  { key: 'json', title: 'JSON', description: 'Structured payload for integrations' },
]

const exportTypesBatch = [
  { key: 'csv', title: 'CSV', description: '17-column GQ-RIS schema' },
]

export default function ExportPage() {
  const [viewMode, setViewMode] = useState('landing')
  const [format, setFormat] = useState('csv')
  const [status, setStatus] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [variety, setVariety] = useState('all')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [sessionCount, setSessionCount] = useState(null)

  // Fetch total session count for the summary card
  useEffect(() => {
    api
        .getSessions()
        .then((data) => {
          const arr = Array.isArray(data) ? data : (data?.content ?? [])
          setSessionCount(arr.length)
        })
        .catch(() => setSessionCount(null))
  }, [])

  const exportLabel = useMemo(() => exportTypes.find((entry) => entry.key === format)?.title ?? 'Export', [format])

  const download = async () => {
    setLoading(true)
    setMessage('Processing export request…')
    try {
      const blob = await api.exportSessions({
        format,
        status: status === 'all' ? undefined : status,
        variety: variety === 'all' ? undefined : variety,
        dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
        dateTo: dateTo ? new Date(dateTo).toISOString() : undefined,
      })
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

  const openConfigForFormat = (fmt) => {
    setFormat(fmt)
    setViewMode('config')
  }

  const openBatchConfig = () => {
    setFormat('csv')
    setViewMode('configBatch')
  }

  const summaryCard = (
      <div className="card export-summary-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <div className="card-title">EXPORT SUMMARY</div>
        <div className="export-big-number" style={{ fontWeight: 700, marginTop: '0.5rem' }}>
          {sessionCount !== null ? sessionCount.toLocaleString() : '—'}
        </div>
        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#556' }}>total sessions</div>
        <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
          <div>Privacy Compliance <strong style={{ float: 'right' }}>AES-256</strong></div>
          <div>Schema <strong style={{ float: 'right' }}>17-col GQ-RIS</strong></div>
          {message && <div style={{ color: loading ? '#2149b7' : '#1a7a3a', fontSize: '0.8rem', marginTop: '0.25rem' }}>{message}</div>}
        </div>
      </div>
  )

  if (viewMode === 'landing') return <ExportLanding setViewMode={setViewMode} summaryCard={summaryCard} />
  if (viewMode === 'processing') return (
      <ExportProcessing
          setViewMode={setViewMode}
          summaryCard={summaryCard}
          openConfigForFormat={openConfigForFormat}
          sessionCount={sessionCount}
      />
  )
  if (viewMode === 'configBatch') return (
      <ExportConfigBatch
          setViewMode={setViewMode}
          summaryCard={summaryCard}
          exportTypes={exportTypesBatch}
          format={format}
          setFormat={setFormat}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          variety={variety}
          setVariety={setVariety}
          download={download}
      />
  )

  return (
      <ExportConfig
          setViewMode={setViewMode}
          summaryCard={summaryCard}
          exportTypes={exportTypes}
          format={format}
          setFormat={setFormat}
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