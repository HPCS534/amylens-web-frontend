function DeviceCard({ deviceRegistration, onManage }) {
  return (
    <article className="device-card">
      <h3>{deviceRegistration.hardwareIdentity}</h3>
      <p>Health: {deviceRegistration.healthStatus}</p>
      <p>Workspace: {deviceRegistration.workspaceAssignment}</p>
      <button type="button" onClick={() => onManage(deviceRegistration)}>
        Manage {deviceRegistration.hardwareIdentity}
      </button>
    </article>
  )
}

export default DeviceCard
