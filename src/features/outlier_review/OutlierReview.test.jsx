import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FlaggedSessionsPage from './FlaggedSessionsPage'

describe('FlaggedSessionsPage', () => {
  it('renders the approve/reject modal actions and requires a note for reject', () => {
    const onSubmitReview = vi.fn()

    render(
      <FlaggedSessionsPage
        sessions={[{ sessionId: 'AS-0100', metricConfidence: 0.925, status: 'flagged' }]}
        onSubmitReview={onSubmitReview}
      />,
    )

    expect(screen.getByText('92.5%')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Review AS-0100' }))

    const approveButton = screen.getByRole('button', { name: 'Approve (Clear Flag)' })
    const rejectButton = screen.getByRole('button', { name: 'Reject Session' })

    expect(rejectButton).toBeEnabled()

    fireEvent.click(rejectButton)
    expect(screen.getByText('Review notes are required before rejecting a session.')).toBeInTheDocument()
    expect(onSubmitReview).not.toHaveBeenCalled()

    fireEvent.click(approveButton)
    expect(onSubmitReview).toHaveBeenCalledWith({ sessionId: 'AS-0100', action: 'approve', reason: '' })
  })
})
