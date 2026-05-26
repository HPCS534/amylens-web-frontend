import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FlaggedSessionsPage from './FlaggedSessionsPage'

describe('FlaggedSessionsPage', () => {
  it('renders metric confidence as a percentage and blocks submission for empty reason comment', () => {
    const onSubmitReview = vi.fn()

    render(
      <FlaggedSessionsPage
        sessions={[{ sessionId: 'AS-0100', metricConfidence: 0.925, status: 'flagged' }]}
        onSubmitReview={onSubmitReview}
      />,
    )

    expect(screen.getByText('92.5%')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Review AS-0100' }))

    const submitButton = screen.getByRole('button', { name: 'Submit Review' })
    expect(submitButton).toBeDisabled()

    fireEvent.click(submitButton)
    expect(onSubmitReview).not.toHaveBeenCalled()
  })
})
