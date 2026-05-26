import { useState } from 'react'
import DeviceCard from './DeviceCard'

const defaultDeviceRegistrations = [
  {
    id: 'DR-1001',
    hardwareIdentity: 'Tablet-A',
    healthStatus: 'Healthy',
    workspaceAssignment: 'Ward 1',
    lastSeenAt: '2026-05-25T10:30:00Z',
  },
  {
    id: 'DR-1002',
    hardwareIdentity: 'Tablet-B',
    healthStatus: 'Warning',
    workspaceAssignment: 'Ward 2',
    lastSeenAt: '2026-05-25T11:20:00Z',
  },
]

function DeviceManagementPage({ deviceRegistrations = defaultDeviceRegistrations }) {
  const [selectedRegistration, setSelectedRegistration] = useState(null)

  const closeModal = () => {
    setSelectedRegistration(null)
  }

  return (
    <section className="panel" aria-label="Device Registration Workspace">
      <h2>Device Registration Workspace</h2>
      <div className="cards">
        {deviceRegistrations.map((registration) => (
          <DeviceCard
            key={registration.id}
            deviceRegistration={registration}
            onManage={setSelectedRegistration}
          />
        ))}
      </div>

      <h3>Assignment Tracking Metadata</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Hardware Identity</th>
            <th>System Health</th>
            <th>Workspace</th>
            <th>Last Seen</th>
          </tr>
        </thead>
        <tbody>
          {deviceRegistrations.map((registration) => (
            <tr key={`meta-${registration.id}`}>
              <td>{registration.hardwareIdentity}</td>
              <td>{registration.healthStatus}</td>
              <td>{registration.workspaceAssignment}</td>
              <td>{registration.lastSeenAt}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedRegistration && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true" aria-label="Device Configuration Modal">
            <h3>{selectedRegistration.hardwareIdentity} Configuration</h3>
            <p>Manage assignment and health routing for this device.</p>
            <div className="modal-actions">
              <button type="button" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default DeviceManagementPage
