import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { clearSession, getToken } from './api/client.js'
import LoginPage from './pages/LoginPage.jsx'
import ImagesPage from './pages/ImagesPage.jsx'
import MaterialsPage from './pages/MaterialsPage.jsx'
import DesignsPage from './pages/DesignsPage.jsx'

const links = [
  { path: '/admin/images', label: 'Images', icon: '▧' },
  { path: '/admin/materials', label: 'Materials', icon: '◈' },
  { path: '/admin/designs', label: 'Designs', icon: '⌂' },
]
function LoginRoute() { return getToken() ? <Navigate to="/admin/images" replace /> : <LoginPage /> }
function ProtectedAdmin() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState({})
  useEffect(() => { try { setUser(JSON.parse(localStorage.getItem('interior-admin-user') || '{}')) } catch { setUser({}) } }, [location.pathname])
  if (!getToken()) return <Navigate to="/login" replace state={{ from: location }} />
  function logout() { clearSession(); navigate('/login', { replace: true }) }
  return <div className="admin-shell">
    <aside className="sidebar">
      <a className="studio-brand" href="/"><span className="brand-mark small">L<span>+</span>L</span><span><strong>leaf & lattice</strong><small>DESIGN STUDIO</small></span></a>
      <div className="sidebar-label">WORKSPACE</div>
      <nav aria-label="Admin sections">{links.map(link => <NavLink key={link.path} to={link.path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><span className="nav-icon">{link.icon}</span>{link.label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="admin-profile"><div className="avatar">{(user.username || user.email || 'A').slice(0,1).toUpperCase()}</div><span><strong>{user.username || 'Administrator'}</strong><small>Studio admin</small></span></div><button className="logout-button" onClick={logout} title="Sign out" aria-label="Sign out">↗</button></div>
    </aside>
    <main className="admin-main"><header className="topbar"><div><span>Studio management</span><span className="crumb-separator">/</span><strong>{links.find(x => x.path === location.pathname)?.label}</strong></div><div className="topbar-user"><span className="status-dot"/> Admin workspace</div></header><Outlet /></main>
  </div>
}
export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/login" element={<LoginRoute />} />
    <Route element={<ProtectedAdmin />}>
      <Route path="/admin/images" element={<ImagesPage />} />
      <Route path="/admin/materials" element={<MaterialsPage />} />
      <Route path="/admin/designs" element={<DesignsPage />} />
    </Route>
    <Route path="*" element={<Navigate to={getToken() ? '/admin/images' : '/login'} replace />} />
  </Routes></BrowserRouter>
}
