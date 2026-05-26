import { useState } from 'react'
import ReviewModal from './ReviewModal'

const defaultFlaggedSessions = [
  { sessionId: 'AS-9001', metricConfidence: 0.742, status: 'flagged' },
  { sessionId: 'AS-9002', metricConfidence: 0.915, status: 'flagged' },
]

function formatMetricConfidence(metricConfidence) {
  return `${(metricConfidence * 100).toFixed(1)}%`
}

function FlaggedSessionsPage({ sessions = defaultFlaggedSessions, onSubmitReview = () => {} }) {
  const [selectedSession, setSelectedSession] = useState(null)
  const [reasonComment, setReasonComment] = useState('')

  const openReview = (analysisSession) => {
    setSelectedSession(analysisSession)
    setReasonComment('')
  }

  const closeReview = () => {
    setSelectedSession(null)
    setReasonComment('')
  }

  const submitReview = (sessionId, reason) => {
    onSubmitReview({ sessionId, reason })
    closeReview()
  }

  return (
    <section className="panel" aria-label="Flagged Outlier Action Grid">
      <h2>Flagged Outlier Sessions</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Metric Confidence</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((analysisSession) => (
            <tr key={analysisSession.sessionId}>
              <td>{analysisSession.sessionId}</td>
              <td>{formatMetricConfidence(analysisSession.metricConfidence)}</td>
              <td>{analysisSession.status}</td>
              <td>
                <button type="button" onClick={() => openReview(analysisSession)}>
                  Review {analysisSession.sessionId}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedSession && (
        <ReviewModal
          analysisSession={selectedSession}
          reasonComment={reasonComment}
          onReasonCommentChange={setReasonComment}
          onClose={closeReview}
          onSubmit={submitReview}
        />
      )}
    </section>
  )
}

export default FlaggedSessionsPage
