import { useRef, useState } from 'react'
import { api } from '../../api/client'

export default function GqrisImportTrigger() {
  const fileInputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const pickFile = () => {
    if (!busy) fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setBusy(true)
    setMessage('Uploading historical CSV mirror...')

    try {
      const result = await api.importGqrisMirror(file)
      const errors = Array.isArray(result?.errors) && result.errors.length > 0
        ? ` Errors: ${result.errors.slice(0, 2).join(' | ')}${result.errors.length > 2 ? '…' : ''}`
        : ''
      setMessage(`Import complete: ${result?.rowsImported ?? 0} rows imported, ${result?.rowsSkipped ?? 0} skipped.${errors}`)
    } catch (error) {
      setMessage(error?.body || error?.message || 'CSV import failed.')
    } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  return (
    <div style={{ display: 'grid', gap: '0.4rem' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-label="Upload historical CSV mirror"
      />
      <button
        className="outline-button"
        type="button"
        onClick={pickFile}
        disabled={busy}
        aria-label="GQ-RIS import trigger"
      >
        {busy ? 'Importing...' : 'Import Historical CSV'}
      </button>
      {message ? <small className="help-note">{message}</small> : null}
    </div>
  )
}