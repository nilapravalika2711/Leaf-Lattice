import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, setAdminSession, setCustomerSession } from '../api/client.js'

export default function LoginPage() {
  const navigate = useNavigate()

  // view: 'login' | 'register'
  const [view, setView] = useState('login')

  // Common login fields (used by BOTH Admin and Customer)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  // Customer registration fields
  const [regFullName, setRegFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function switchView(target) {
    setView(target)
    setError('')
  }

  // Common Login Handler for both Admin and Customer
  async function submitLogin(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const session = await authApi.login(identifier, password)

      // Separate session storage and redirect based on role
      if (session.role === 'Admin') {
        setAdminSession(session)
        navigate('/admin/dashboard', { replace: true })
      } else {
        setCustomerSession(session)
        navigate('/customer/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Invalid email, username, or password.')
    } finally {
      setBusy(false)
    }
  }

  // Customer Registration Handler (in-place on the same page)
  async function submitRegister(e) {
    e.preventDefault()
    setError('')

    if (!regFullName.trim()) {
      setError('Please provide your full name.')
      return
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setError('Please provide a valid email address.')
      return
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please verify your password.')
      return
    }

    setBusy(true)
    try {
      const session = await authApi.customerRegister({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
      })
      setCustomerSession(session)
      navigate('/customer/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-page">
      {/* Centered translucent white login card */}
      <div className="login-card">
        {/* Brand identity */}
        <div className="login-card-brand">
          <div className="brand-mark">
            L<span>+</span>L
          </div>
          <strong className="brand-title">leaf & lattice</strong>
          <p className="eyebrow">Interior Design Studio</p>
        </div>

        {error && <div className="notice error">{error}</div>}

        {/* 1. UNIFIED LOGIN FORM (BOTH ADMIN AND CUSTOMER) */}
        {view === 'login' && (
          <div>
            <div className="login-card-header">
              <h2>Welcome Back</h2>
              <p>Sign in to access your dashboard</p>
            </div>

            <form onSubmit={submitLogin} className="stack-form">
              <label>
                Email or Username
                <input
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@domain.com or admin"
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </label>

              <button type="submit" className="button primary full" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign In'} <span aria-hidden="true">↗</span>
              </button>
            </form>

            <div className="auth-toggle-prompt">
              <span>New customer?</span>{' '}
              <button
                type="button"
                className="link-btn highlight"
                onClick={() => switchView('register')}
              >
                Register as Customer
              </button>
            </div>
          </div>
        )}

        {/* 2. CUSTOMER REGISTRATION FORM */}
        {view === 'register' && (
          <div>
            <div className="login-card-header">
              <h2>Create Account</h2>
              <p>Register to explore designer catalogues</p>
            </div>

            <form onSubmit={submitRegister} className="stack-form">
              <label>
                Full Name
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@domain.com"
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </label>

              <label>
                Confirm Password
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                />
              </label>

              <button type="submit" className="button primary full" disabled={busy}>
                {busy ? 'Creating account…' : 'Register as Customer'} <span aria-hidden="true">→</span>
              </button>
            </form>

            <div className="auth-toggle-prompt">
              <span>Already have an account?</span>{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => switchView('login')}
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
