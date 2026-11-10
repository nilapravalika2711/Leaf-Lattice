import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, setSession } from '../api/client.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const session = await authApi.login(identifier, password)
      setSession(session)
      navigate('/admin/images', { replace: true })
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  return (
    <main className="login-page">
      <section className="login-art">
        <div className="brand-mark">L<span>+</span>L</div>
        <div className="login-copy"><p className="eyebrow">Interior Design Studio</p><h1>Make room for<br />better living.</h1><p>A thoughtful space to manage your design library, materials, and curated projects.</p></div>
        <span className="login-caption">ADMINISTRATIVE WORKSPACE · EST. 2025</span>
      </section>
      <section className="login-panel">
        <div className="login-form-wrap">
          <p className="eyebrow">Welcome back</p><h2>Sign in to your studio</h2><p className="muted">Use your administrator credentials to continue.</p>
          <form onSubmit={submit} className="stack-form">
            <label>Email or username<input autoComplete="username" required value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="admin@yourstudio.com" /></label>
            <label>Password<input autoComplete="current-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" /></label>
            {error && <div className="notice error">{error}</div>}
            <button className="button primary full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <span aria-hidden="true">↗</span></button>
          </form>
          <p className="login-footnote">Private workspace for studio administrators</p>
        </div>
      </section>
    </main>
  )
}
