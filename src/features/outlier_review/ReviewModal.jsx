function ReviewModal({ analysisSession, reasonComment, onReasonCommentChange, onClose, onSubmit }) {
  const hasReason = reasonComment.trim().length > 0

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-label="Outlier Review Modal">
        <h3>Review Session {analysisSession.sessionId}</h3>
        <label htmlFor="reason-comment">Reason Comment</label>
        <textarea
          id="reason-comment"
          value={reasonComment}
          onChange={(event) => onReasonCommentChange(event.target.value)}
          rows={4}
        />
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmit(analysisSession.sessionId, reasonComment)}
            disabled={!hasReason}
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReviewModal
