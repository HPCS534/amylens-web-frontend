import './App.css'
import DeviceManagementPage from './features/device_workspace/DeviceManagementPage'
import FlaggedSessionsPage from './features/outlier_review/FlaggedSessionsPage'
import WireframesGallery from './features/wireframes/WireframesGallery'

function App() {
  return (
    <main className="dashboard">
      <h1>AmyLens Management Dashboard</h1>
      <DeviceManagementPage />
      <FlaggedSessionsPage />
      <WireframesGallery />
    </main>
  )
}

export default App
