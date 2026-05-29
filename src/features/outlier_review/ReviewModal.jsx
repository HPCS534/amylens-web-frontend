function formatMetricConfidence(metricConfidence) {
  return `${(metricConfidence * 100).toFixed(1)}%`
}

import { UI_LABELS } from '../../config/entities'

function formatReviewTimestamp(timestamp) {
  if (!timestamp) return UI_LABELS.pendingAssignment === undefined ? 'Pending' : UI_LABELS.pendingAssignment
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return String(timestamp)
  return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')
}

function ReviewModal({ analysisSession, reasonComment, onReasonCommentChange, onClose, onApprove, onReject, noteError, reviewerIdentity }) {

  return (
    <div className="modal-backdrop review-backdrop">
      <div className="modal review-modal" role="dialog" aria-modal="true" aria-label="Review Flagged Session">
        <div className="review-modal-header">
          <div className="review-title-row">
            <span className="review-warning-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                <path d="M12 2 1 22h22L12 2zm0 6.2 4.4 8.4H7.6L12 8.2zm-1 3.3v3.2h2v-3.2h-2zm0 4.2v2h2v-2h-2z" fill="currentColor" />
              </svg>
            </span>
            <h3>Review Flagged Session</h3>
          </div>
          <button className="icon-button review-close-button" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="review-modal-warning">
          Rejecting this session will permanently invalidate the session data.
        </div>

        <div className="review-modal-body">
          <div className="review-detail-card">
            <div>
              <div className="review-label">SESSION ID</div>
              <div className="review-value">{analysisSession.sessionId}</div>
            </div>
            <div>
              <div className="review-label">FLAG REASON</div>
              <div className="review-value review-reason">{analysisSession.flagReason ?? 'Manual Flag: Validation Required'}</div>
            </div>
          </div>

          <div className="review-detail-card" style={{ marginTop: '1rem' }}>
            <div>
              <div className="review-label">REVIEWER</div>
              <div className="review-value">{reviewerIdentity ?? analysisSession.reviewerIdentity ?? UI_LABELS.pendingAssignment}</div>
            </div>
            <div>
              <div className="review-label">REVIEW TIMESTAMP</div>
              <div className="review-value">{formatReviewTimestamp(analysisSession.reviewTimestamp ?? analysisSession.__raw?.reviewedAt)}</div>
            </div>
          </div>

          <div className="field-group review-note-group">
            <label htmlFor="reason-comment">Review Notes <span className="review-required">*</span></label>
              <textarea
              id="reason-comment"
              value={reasonComment}
              onChange={(event) => onReasonCommentChange(event.target.value)}
              rows={6}
              placeholder={UI_LABELS.provideJustificationPlaceholder}
            />
          </div>

          {noteError && <div className="review-error">{noteError}</div>}

          <div className="review-assistive">Your justification will be logged for auditing purposes.</div>
        </div>

        <div className="review-modal-actions">
          <button className="primary-button review-approve-button" type="button" onClick={() => onApprove(analysisSession.sessionId)}>
            <span className="review-button-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2zm4.7 7.9-5.3 5.3-2.8-2.8 1.4-1.4 1.4 1.4 3.9-3.9z" fill="currentColor" />
              </svg>
            </span>
            Approve (Clear Flag)
          </button>
          <button className="ghost-button review-cancel-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="reject-button review-reject-button" type="button" onClick={() => onReject(analysisSession.sessionId, reasonComment)}>
            <span className="review-button-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                <path d="M6 3h12l3 4v14H3V3h3zm2 4h8V5H8v2zm1 4 3 3 3-3 1.4 1.4-3 3 3 3L15 19l-3-3-3 3-1.4-1.4 3-3-3-3L9 11z" fill="currentColor" />
              </svg>
            </span>
            Reject Session
          </button>
        </div>
      </div>
    </div>
  )
}

function ReviewSuccessModal({ action, reviewerIdentity, reviewTimestamp, reviewerNote, onDismissAndRefresh }) {
  const isApprove = action === 'approve'

  return (
    <div className="modal-backdrop review-backdrop">
      <div className="modal review-success-modal" role="dialog" aria-modal="true" aria-label="Review Success">
        <div className="review-success-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="presentation" focusable="false">
            <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2zm-1 13.2-3.1-3.1 1.4-1.4 1.7 1.7 4.3-4.3 1.4 1.4z" fill="currentColor" />
          </svg>
        </div>
        <div className="review-success-title">{isApprove ? 'Session Approved Successfully' : 'Session Rejected Successfully'}</div>
        <div className="review-success-copy">
          {isApprove
            ? 'The session flag has been resolved and the data has been verified for institutional reporting.'
            : 'The session flag has been resolved and the data has been invalidated for security purposes.'}
        </div>
        <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.35rem', fontSize: '0.9rem', color: '#374151' }}>
          <div><strong>Reviewer:</strong> {reviewerIdentity ?? UI_LABELS.unknownReviewer}</div>
          <div><strong>Timestamp:</strong> {formatReviewTimestamp(reviewTimestamp)}</div>
          {reviewerNote ? <div><strong>Note:</strong> {reviewerNote}</div> : null}
        </div>
        <button className="primary-button review-success-button" type="button" onClick={onDismissAndRefresh}>
          Dismiss and Refresh
        </button>
      </div>
    </div>
  )
}

export { ReviewSuccessModal }
export default ReviewModal
