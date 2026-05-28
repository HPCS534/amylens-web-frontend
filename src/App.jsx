import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './features/auth/LoginPage'
import PasswordResetPage from './features/auth/PasswordResetPage'
import { AuthProvider, useAuth } from './features/auth/AuthProvider'
import DashboardShell from './features/layout/DashboardShell'
import DeviceManagementPage from './features/device_workspace/DeviceManagementPage'
import FlaggedSessionsPage from './features/outlier_review/FlaggedSessionsPage'
import AnalyticsPage from './features/analytics/AnalyticsPage'
import ExportPage from './features/data_export/ExportPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth()
  if (initializing) return <div className="dashboard-loading">Loading session…</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<PasswordResetPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardShell>
                  <Navigate to="devices" replace />
                </DashboardShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/devices"
            element={
              <ProtectedRoute>
                <DashboardShell>
                  <DeviceManagementPage />
                </DashboardShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/flagged-sessions"
            element={
              <ProtectedRoute>
                <DashboardShell>
                  <FlaggedSessionsPage />
                </DashboardShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/analytics"
            element={
              <ProtectedRoute>
                <DashboardShell>
                  <AnalyticsPage />
                </DashboardShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/export"
            element={
              <ProtectedRoute>
                <DashboardShell>
                  <ExportPage />
                </DashboardShell>
              </ProtectedRoute>
            }
          />
            <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
