import { useEffect, useMemo, useState } from 'react'
import { api } from '../../api/client'
import { useAuth } from '../auth/AuthProvider'
import ReviewModal, { ReviewSuccessModal } from './ReviewModal'

function normalizeSessions(payload) {
  let sessions = null
  if (Array.isArray(payload)) sessions = payload
  else if (Array.isArray(payload?.content)) sessions = payload.content
  else if (Array.isArray(payload?.sessions)) sessions = payload.sessions
  else return []

  if (!Array.isArray(sessions)) return []

  // Normalize various backend shapes to the UI's expected fields
  return sessions.map((s) => {
    const metricConfidence = typeof s.metricConfidence === 'number'
      ? s.metricConfidence
      : typeof s.confidenceScore === 'number'
        ? s.confidenceScore
        : typeof s.confidence === 'number'
          ? s.confidence
          : undefined

    return {
      // UI expects `sessionId`; backend may return `id`.
      sessionId: s.sessionId ?? s.id ?? s.imageHash ?? null,
      metricConfidence: metricConfidence ?? 0,
      flagReason: s.flagReason ?? s.verdictReason ?? (s.needsReview ? 'Manual Flag: Validation Required' : s.verdict ?? null),
      technician: s.technician ?? s.userName ?? s.user ?? null,
      reviewerIdentity: s.reviewerIdentity ?? s.reviewedBy ?? s.reviewedByUsername ?? null,
      reviewTimestamp: s.reviewTimestamp ?? s.reviewedAt ?? s.reviewed_at ?? null,
      reviewerNote: s.reviewerNote ?? s.reviewNote ?? s.review_reason ?? null,
      // keep original payload for modal/details
      __raw: s,
    }
  })
}

function formatReviewTimestamp(timestamp) {
  if (!timestamp) return 'Pending'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return String(timestamp)
  return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')
}

function formatMetricConfidence(metricConfidence) {
  const value = Number(metricConfidence)
  if (!Number.isFinite(value)) return '—'
  return `${(value * 100).toFixed(1)}%`
}

function FlaggedSessionsPage({ sessions = [], onSubmitReview = () => {} }) {
  const [records, setRecords] = useState(sessions)
  const [selectedSession, setSelectedSession] = useState(null)
  const [reasonComment, setReasonComment] = useState('')
  const [reviewOutcome, setReviewOutcome] = useState(null)
  const [noteError, setNoteError] = useState('')

  useEffect(() => {
    let active = true
    api
      .getSessions({ status: 'needs_review' })
      .then((payload) => {
        if (!active) return
        setRecords(normalizeSessions(payload))
      })
      .catch(() => {
        if (active) setRecords(sessions)
      })
    return () => {
      active = false
    }
  }, [sessions])

  const { currentUser } = useAuth()

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

  const refreshSessions = async () => {
    try {
      const payload = await api.getSessions({ status: 'needs_review' })
      setRecords(normalizeSessions(payload))
    } catch (error) {
      if (!import.meta.env.DEV) throw error
    }
  }

  const reviewSession = async (sessionId, action, reason = '') => {
    if (action === 'reject' && !reason.trim()) {
      setNoteError('Review notes are required before rejecting a session.')
      return
    }

    setNoteError('')
    const reviewerIdentity = currentUser?.username ?? 'unknown'
    const reviewTimestamp = new Date().toISOString()
    const reviewerNote = reason.trim()

    try {
      await api.reviewSession(sessionId, {
        action,
        reviewerNote: reviewerNote || undefined,
        reviewerIdentity,
        reviewTimestamp,
      })
    } catch (error) {
      if (!import.meta.env.DEV) throw error
    }

    onSubmitReview({ sessionId, action, reviewerIdentity, reviewTimestamp, reviewerNote })
    setRecords((current) => current.filter((record) => record.sessionId !== sessionId))
    setReviewOutcome({ sessionId, action, reviewerIdentity, reviewTimestamp, reviewerNote })
    closeReview()
  }

  const dismissAndRefresh = async () => {
    setReviewOutcome(null)
    await refreshSessions()
  }

  const summary = useMemo(() => ({ total: records.length, urgent: records.filter((record) => record.metricConfidence >= 0.9).length }), [records])

  return (
    <div className="module-grid" aria-label="Flagged Sessions Workspace">
      <div className="pill-row">
        <span className="pill pill-danger">{summary.urgent} Requires Attention</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
          <button className="outline-button" type="button">Filters</button>
          <button className="outline-button" type="button">Export List</button>
        </div>
      </div>

      <section className="section-card">
        <div className="section-head">
          <div>
            <h2 className="section-title">Pending Session Reviews</h2>
            <div className="section-subtitle">Latest update: 14:22:01 UTC</div>
          </div>
        </div>

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
                        <span style={{ width: `${Math.round(analysisSession.metricConfidence * 100)}%`, background: analysisSession.metricConfidence >= 0.9 ? '#ef4444' : '#2149b7' }} />
                      </div>
                      <span style={{ color: analysisSession.metricConfidence >= 0.9 ? '#ef4444' : '#2149b7', fontWeight: 700 }}>{formatMetricConfidence(analysisSession.metricConfidence)}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: '#1f2937' }}>●</span> {analysisSession.flagReason ?? 'Manual Flag: Validation Required'}
                  </td>
                  <td>
                    <span className="badge badge-healthy">{(analysisSession.technician ?? 'JD').slice(0, 2).toUpperCase()}</span> {analysisSession.technician ?? 'John Doe'}
                    {(analysisSession.reviewerIdentity || analysisSession.reviewTimestamp) && (
                      <div style={{ marginTop: '0.25rem', fontSize: '0.78rem', color: '#6b7280' }}>
                        Reviewed by <strong>{analysisSession.reviewerIdentity ?? 'Unknown'}</strong>
                        {' '}
                        · {formatReviewTimestamp(analysisSession.reviewTimestamp)}
                      </div>
                    )}
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

        <div className="meta-footer">
          <div>Showing {Math.min(3, summary.total)} of {summary.total} flagged sessions</div>
          <div className="pagination">
            <button type="button">‹</button>
            <button type="button" className="active">1</button>
            <button type="button">2</button>
            <button type="button">›</button>
          </div>
        </div>
      </section>

      {selectedSession && (
        <ReviewModal
          analysisSession={selectedSession}
          reasonComment={reasonComment}
          onReasonCommentChange={setReasonComment}
          onClose={closeReview}
          noteError={noteError}
          reviewerIdentity={currentUser?.username}
          onApprove={(sessionId) => reviewSession(sessionId, 'approve')}
          onReject={(sessionId, reason) => reviewSession(sessionId, 'reject', reason)}
        />
      )}

      {reviewOutcome && (
        <ReviewSuccessModal
          action={reviewOutcome.action}
          reviewerIdentity={reviewOutcome.reviewerIdentity}
          reviewTimestamp={reviewOutcome.reviewTimestamp}
          reviewerNote={reviewOutcome.reviewerNote}
          onDismissAndRefresh={dismissAndRefresh}
        />
      )}
    </div>
  )
}

export default FlaggedSessionsPage
