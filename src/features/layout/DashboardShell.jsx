import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import './DashboardShell.css'

const navItems = [
  { to: '/app/devices', label: 'Devices', icon: '▣' },
  { to: '/app/flagged-sessions', label: 'Flagged Sessions', icon: '⚠' },
  { to: '/app/analytics', label: 'Analytics', icon: '▤' },
  { to: '/app/export', label: 'Data Export', icon: '⇪' },
]

export default function DashboardShell({ children }) {
  const { logout } = useAuth()
  const location = useLocation()

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-title">Control Center</div>
          <div className="sidebar-brand-sub">Management Dashboard</div>
        </div>

        <nav className="sidebar-nav" aria-label="Module 4 navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="nav-item nav-button" onClick={() => logout()}>
            <span className="nav-icon">⎋</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <section className="shell-main">
        <header className="shell-topbar">
          <div className="shell-topbar-left">
            <div className="shell-title">{navItems.find((item) => location.pathname.startsWith(item.to))?.label ?? 'Dashboard'}</div>
            <div className="search-shell">
              <span className="search-icon">⌕</span>
              <input placeholder="Search sessions..." aria-label="Search sessions" />
            </div>
          </div>

          <div className="shell-topbar-right">
            {/* <button className="icon-button" aria-label="Notifications">◌</button>
            <button className="icon-button" aria-label="Recent activity">↺</button> */}
            <div className="profile-chip">
              <div className="avatar">AS</div>
              <div>
                <div className="profile-name">Alex Sterling</div>
                <div className="profile-role">TEAM LEAD</div>
              </div>
            </div>
          </div>
        </header>

        <main className="shell-content">{children}</main>
      </section>
    </div>
  )
}