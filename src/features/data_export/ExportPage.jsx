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
  { key: 'pdf', title: 'PDF', description: 'One-session printable report' },
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

  const download = async () => {
    setLoading(true)
    setMessage('Processing export request…')
    try {
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
      <div className="export-big-number" style={{ fontWeight: 700, marginTop: '0.5rem' }}>1,284</div>
      <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
        <div>Estimated Size <strong style={{ float: 'right' }}>14.2 MB</strong></div>
        <div>Privacy Compliance <strong style={{ float: 'right' }}>AES-256</strong></div>
        <div>Estimated Time <strong style={{ float: 'right' }}>~45 seconds</strong></div>
        <div>Schema <strong style={{ float: 'right' }}>14-col GQ-RIS</strong></div>
      </div>
    </div>
  )
  if (viewMode === 'landing') return <ExportLanding setViewMode={setViewMode} summaryCard={summaryCard} />
  if (viewMode === 'processing') return (
    <ExportProcessing
      setViewMode={setViewMode}
      summaryCard={summaryCard}
      openConfigForFormat={openConfigForFormat}
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
