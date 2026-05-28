import { useEffect, useMemo, useState } from 'react'
import { api } from '../../api/client'
import { useAuth } from '../auth/AuthProvider'
import ReviewModal, { ReviewSuccessModal } from './ReviewModal'

// Map API session shape → page shape
function normalizeSession(s) {
  return {
    // use numeric id as the stable key for review calls
    sessionId: s.id ?? s.sessionId,
    metricConfidence: s.confidenceScore ?? s.metricConfidence ?? 0,
    flagReason: s.verdictReason ?? s.flagReason ?? 'Manual Flag: Validation Required',
    technician: s.userName ?? s.technician ?? '—',
    status: s.verdict ?? s.status ?? 'needs_review',
  }
}

function normalizeSessions(payload) {
  let sessions = null
  if (Array.isArray(payload)) sessions = payload
  else if (Array.isArray(payload?.content)) sessions = payload.content
  else if (Array.isArray(payload?.sessions)) sessions = payload.sessions
  else return []
  return sessions.map(normalizeSession)
}

function formatMetricConfidence(metricConfidence) {
  return `${(metricConfidence * 100).toFixed(1)}%`
}

function FlaggedSessionsPage({ onSubmitReview = () => {} }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [reasonComment, setReasonComment] = useState('')
  const [reviewOutcome, setReviewOutcome] = useState(null)
  const [noteError, setNoteError] = useState('')

  const { currentUser } = useAuth()

  const fetchSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = await api.getSessions({ status: 'needs_review' })
      setRecords(normalizeSessions(payload))
    } catch {
      setError('Failed to load flagged sessions.')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const openReview = (analysisSession) => {
    setSelectedSession(analysisSession)
    setReasonComment('')
    setNoteError('')
  }

  const closeReview = () => {
    setSelectedSession(null)
    setReasonComment('')
    setNoteError('')
  }

  const reviewSession = async (sessionId, action, reason = '') => {
    if (action === 'reject' && !reason.trim()) {
      setNoteError('Review notes are required before rejecting a session.')
      return
    }
    setNoteError('')
    try {
      await api.reviewSession(sessionId, {
        action,
        reviewerNote: reason.trim() || undefined,
        reviewerIdentity: currentUser?.username,
      })
    } catch (err) {
      if (!import.meta.env.DEV) throw err
    }
    onSubmitReview({ sessionId, action, reason })
    setRecords((current) => current.filter((record) => record.sessionId !== sessionId))
    setReviewOutcome({ sessionId, action })
    closeReview()
  }

  const dismissAndRefresh = async () => {
    setReviewOutcome(null)
    await fetchSessions()
  }

  const summary = useMemo(
      () => ({
        total: records.length,
        urgent: records.filter((r) => r.metricConfidence >= 0.9).length,
      }),
      [records]
  )

  return (
      <div className="module-grid" aria-label="Flagged Sessions Workspace">
        <div className="pill-row">
          <span className="pill pill-danger">{summary.urgent} Requires Attention</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
            <button className="outline-button" type="button" onClick={fetchSessions}>Refresh</button>
          </div>
        </div>

        <section className="section-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">Pending Session Reviews</h2>
              <div className="section-subtitle">
                {loading ? 'Loading…' : `${summary.total} session${summary.total !== 1 ? 's' : ''} pending review`}
              </div>
            </div>
          </div>

          {loading && <div style={{ padding: '2rem', textAlign: 'center', color: '#556' }}>Loading flagged sessions…</div>}
          {error && <div style={{ padding: '1rem', color: '#cc1f1f' }}>{error}</div>}

          {!loading && !error && records.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#556' }}>No sessions flagged for review.</div>
          )}

          {!loading && records.length > 0 && (
              <div className="table-wrap">
                <table className="module-table">
                  <thead>
                  <tr>
                    <th>Session ID</th>
                    <th>AI Confidence</th>
                    <th>Flag Reason</th>
                    <th>Technician</th>
                    <th>Action</th>
                  </tr>
                  </thead>
                  <tbody>
                  {records.map((analysisSession) => (
                      <tr key={analysisSession.sessionId}>
                        <td>
                          <strong style={{ color: '#2149b7' }}>{analysisSession.sessionId}</strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 220 }}>
                            <div className="mini-progress" style={{ flex: 1 }} aria-hidden="true">
                          <span
                              style={{
                                width: `${Math.round(analysisSession.metricConfidence * 100)}%`,
                                background: analysisSession.metricConfidence >= 0.9 ? '#ef4444' : '#2149b7',
                              }}
                          />
                            </div>
                            <span style={{ color: analysisSession.metricConfidence >= 0.9 ? '#ef4444' : '#2149b7', fontWeight: 700 }}>
                          {formatMetricConfidence(analysisSession.metricConfidence)}
                        </span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: '#1f2937' }}>●</span> {analysisSession.flagReason}
                        </td>
                        <td>
                          <span className="badge badge-healthy">{analysisSession.technician.slice(0, 2).toUpperCase()}</span>{' '}
                          {analysisSession.technician}
                        </td>
                        <td>
                          <button
                              className="ghost-button"
                              type="button"
                              aria-label={`Review ${analysisSession.sessionId}`}
                              onClick={() => openReview(analysisSession)}
                          >
                            Review Data ›
                          </button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}

          <div className="meta-footer">
            <div>Showing {records.length} flagged session{records.length !== 1 ? 's' : ''}</div>
          </div>
        </section>

        {selectedSession && (
            <ReviewModal
                analysisSession={selectedSession}
                reasonComment={reasonComment}
                onReasonCommentChange={setReasonComment}
                onClose={closeReview}
                noteError={noteError}
                onApprove={(sessionId) => reviewSession(sessionId, 'approve')}
                onReject={(sessionId, reason) => reviewSession(sessionId, 'reject', reason)}
            />
        )}

        {reviewOutcome && (
            <ReviewSuccessModal action={reviewOutcome.action} onDismissAndRefresh={dismissAndRefresh} />
        )}
      </div>
  )
}

export default FlaggedSessionsPage