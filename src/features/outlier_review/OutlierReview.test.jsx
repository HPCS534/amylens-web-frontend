import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FlaggedSessionsPage from './FlaggedSessionsPage'

describe('FlaggedSessionsPage', () => {
  it('renders the approve/reject modal actions and requires a note for reject', async () => {
    const onSubmitReview = vi.fn()

    render(
      <FlaggedSessionsPage
        sessions={[{ sessionId: 'AS-0100', metricConfidence: 0.925, status: 'flagged' }]}
        onSubmitReview={onSubmitReview}
      />,
    )

    expect(screen.getByText('92.5%')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Review AS-0100' }))

    const approveButton = screen.getByRole('button', { name: 'Approve (Clear Flag)' })
    const rejectButton = screen.getByRole('button', { name: 'Reject Session' })

    expect(rejectButton.disabled).toBe(false)

    fireEvent.click(rejectButton)
    expect(screen.getByText('Review notes are required before rejecting a session.')).toBeTruthy()
    expect(onSubmitReview).not.toHaveBeenCalled()

    fireEvent.click(approveButton)

    await waitFor(() => {
      expect(onSubmitReview).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'AS-0100',
          action: 'approve',
          reviewerIdentity: 'unknown',
          reviewerNote: '',
        }),
      )
    })

    expect(screen.getByText('Session Approved Successfully')).toBeTruthy()
    expect(screen.getByText(/Reviewer:/)).toBeTruthy()
    expect(screen.getByText(/Timestamp:/)).toBeTruthy()
  })
})
