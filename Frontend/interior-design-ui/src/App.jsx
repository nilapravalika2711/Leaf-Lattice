import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { clearAdminSession, clearCustomerSession, getAdminToken, getCustomerToken } from './api/client.js'
import LoginPage from './pages/LoginPage.jsx'
import ImagesPage from './pages/ImagesPage.jsx'
import MaterialsPage from './pages/MaterialsPage.jsx'
import DesignsPage from './pages/DesignsPage.jsx'
import CustomerDashboard from './pages/CustomerDashboard.jsx'

const links = [
  { path: '/admin/dashboard', label: 'Designs & Sales', icon: '⌂' },
  { path: '/admin/images', label: 'Images', icon: '▧' },
  { path: '/admin/materials', label: 'Materials', icon: '◈' },
]

function RootRoute() {
  if (getAdminToken()) return <Navigate to="/admin/dashboard" replace />
  if (getCustomerToken()) return <Navigate to="/customer/dashboard" replace />
  return <LoginPage />
}

function ProtectedAdmin() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState({})

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem('interior-admin-user') || '{}'))
    } catch {
      setUser({})
    }
  }, [location.pathname])

  if (!getAdminToken()) return <Navigate to="/" replace state={{ from: location }} />

  function logout() {
    clearAdminSession()
    navigate('/', { replace: true })
  }

  const currentLabel = links.find(x => x.path === location.pathname)?.label || 'Designs'

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <a className="studio-brand" href="/">
          <span className="brand-mark small">L<span>+</span></span>
          <span><strong>leaf & lattice</strong><small>DESIGN STUDIO</small></span>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <nav aria-label="Admin sections">
          {links.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="avatar">{(user.username || user.email || 'A').slice(0, 1).toUpperCase()}</div>
            <span><strong>{user.username || 'Administrator'}</strong><small>Studio admin</small></span>
          </div>
          <button className="logout-button" onClick={logout} title="Sign out" aria-label="Sign out">↗</button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="topbar">
          <div>
            <span>Studio management</span>
            <span className="crumb-separator">/</span>
            <strong>{currentLabel}</strong>
          </div>
          <div className="topbar-user"><span className="status-dot" /> Admin workspace</div>
        </header>
        <Outlet />
      </main>
    </div>
  )
}

function ProtectedCustomer() {
  const location = useLocation()
  if (!getCustomerToken()) return <Navigate to="/" replace state={{ from: location }} />
  return <CustomerDashboard />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Single Common Entrypoint */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<Navigate to="/" replace />} />

        {/* Customer Portal */}
        <Route path="/customer/dashboard" element={<ProtectedCustomer />} />

        {/* Admin Portal */}
        <Route element={<ProtectedAdmin />}>
          <Route path="/admin/dashboard" element={<DesignsPage />} />
          <Route path="/admin/designs" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/images" element={<ImagesPage />} />
          <Route path="/admin/materials" element={<MaterialsPage />} />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate
              to={getAdminToken() ? '/admin/dashboard' : getCustomerToken() ? '/customer/dashboard' : '/'}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
