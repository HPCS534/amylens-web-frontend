function DeviceCard({ deviceRegistration, onManage, onApprove, onDeny }) {
  const isHealthy = deviceRegistration.healthStatus === 'Healthy'
  return (
    <article className="device-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3>{deviceRegistration.hardwareIdentity}</h3>
        <span className={`badge ${isHealthy ? 'badge-healthy' : 'badge-warning'}`}>{deviceRegistration.healthStatus}</span>
      </div>
      <p className="small">Workspace: {deviceRegistration.workspaceAssignment}</p>
      <p className="small">Last seen: {deviceRegistration.lastSeenAt}</p>
      <div className="device-actions">
        <button
          className="btn btn-ghost"
          type="button"
          aria-label={`Manage ${deviceRegistration.hardwareIdentity}`}
          onClick={() => onManage(deviceRegistration)}
        >
          Manage
        </button>
        <button className="btn btn-primary" type="button" onClick={() => onApprove && onApprove(deviceRegistration.id)}>
          Approve
        </button>
        <button className="btn" type="button" onClick={() => onDeny && onDeny(deviceRegistration.id)}>
          Deny
        </button>
      </div>
    </article>
  )
}

export default DeviceCard
