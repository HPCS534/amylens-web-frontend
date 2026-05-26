import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DeviceManagementPage from './DeviceManagementPage'

describe('DeviceManagementPage', () => {
  it('opens and closes configuration modal when management card controls are clicked', () => {
    render(
      <DeviceManagementPage
        deviceRegistrations={[
          {
            id: 'DR-2001',
            hardwareIdentity: 'Tablet-X',
            healthStatus: 'Healthy',
            workspaceAssignment: 'Workspace-A',
            lastSeenAt: '2026-05-26T00:00:00Z',
          },
        ]}
      />,
    )

    expect(screen.queryByRole('dialog', { name: 'Device Configuration Modal' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Manage Tablet-X' }))
    expect(screen.getByRole('dialog', { name: 'Device Configuration Modal' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog', { name: 'Device Configuration Modal' })).not.toBeInTheDocument()
  })
})
