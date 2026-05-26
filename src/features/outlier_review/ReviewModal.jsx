function formatMetricConfidence(metricConfidence) {
  return `${(metricConfidence * 100).toFixed(1)}%`
}

function ReviewModal({ analysisSession, reasonComment, onReasonCommentChange, onClose, onSubmit }) {
  const hasReason = reasonComment.trim().length > 0

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-label="Outlier Review Modal">
        <div className="modal-header">
          <div>
            <div className="card-title" style={{ marginBottom: '0.25rem' }}>Review Session</div>
            <h3 style={{ margin: 0 }}>{analysisSession.sessionId}</h3>
            <div className="subtle">Approve or reject this flagged record after inspection.</div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <div className="mini-summary" style={{ marginBottom: '1rem' }}>
            <strong>{formatMetricConfidence(analysisSession.metricConfidence ?? 0)}</strong>
            <div className="subtle">AI confidence</div>
          </div>
          <div className="field-group">
            <label htmlFor="reason-comment">Reviewer Note</label>
            <textarea
              id="reason-comment"
              value={reasonComment}
              onChange={(event) => onReasonCommentChange(event.target.value)}
              rows={4}
              placeholder="Add a note if you reject the session..."
            />
          </div>
          <div className="help-note">Reject requires a reviewer note. Approve can proceed with an empty note.</div>
        </div>
        <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
          <button className="ghost-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="outline-button" type="button" onClick={() => onSubmit(analysisSession.sessionId, reasonComment)}>
              Approve
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={() => onSubmit(analysisSession.sessionId, reasonComment)}
              disabled={!hasReason}
            >
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewModal
