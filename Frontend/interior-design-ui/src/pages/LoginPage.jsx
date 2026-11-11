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
  const [showPassword, setShowPassword] = useState(false)

  // Customer registration fields
  const [regFullName, setRegFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)

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
      {/* Centered Transparent Glass Style Login Card */}
      <div className="login-card glass-card">
        {/* Brand identity */}
        <div className="login-card-brand">
          <div className="brand-logo-badge">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="brand-leaf-icon"
              aria-hidden="true"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
            <span className="brand-mark">
              L<span>+</span>L
            </span>
          </div>
          <strong className="brand-title">Leaf &amp; Lattice</strong>
          <p className="eyebrow">Interior Design Studio</p>
        </div>

        {error && (
          <div className="notice error" role="alert">
            {error}
          </div>
        )}

        {/* 1. UNIFIED LOGIN FORM (BOTH ADMIN AND CUSTOMER) */}
        {view === 'login' && (
          <div>
            <div className="login-card-header">
              <h2>Welcome Back</h2>
              <p>Sign in to Leaf &amp; Lattice</p>
            </div>

            <form onSubmit={submitLogin} className="glass-form">
              <div className="form-group">
                <label htmlFor="login-identifier" className="input-label">
                  Email Address
                </label>
                <div className="input-box-wrapper">
                  <span className="input-icon" aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    id="login-identifier"
                    type="text"
                    autoComplete="username"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your email or username"
                    className="glass-input has-left-icon"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="login-password" className="input-label">
                  Password
                </label>
                <div className="input-box-wrapper">
                  <span className="input-icon" aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="glass-input has-left-icon has-right-icon"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2 2l20 20" />
                        <path d="M8.71 8.71a4 4 0 0 0 5.58 5.58" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="button sage-btn full" disabled={busy}>
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
                Register here
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

            <form onSubmit={submitRegister} className="glass-form">
              <div className="form-group">
                <label htmlFor="reg-name" className="input-label">
                  Full Name
                </label>
                <div className="input-box-wrapper">
                  <span className="input-icon" aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="glass-input has-left-icon"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-email" className="input-label">
                  Email Address
                </label>
                <div className="input-box-wrapper">
                  <span className="input-icon" aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="glass-input has-left-icon"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-pass" className="input-label">
                  Password
                </label>
                <div className="input-box-wrapper">
                  <span className="input-icon" aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="reg-pass"
                    type={showRegPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="glass-input has-left-icon has-right-icon"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                    title={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2 2l20 20" />
                        <path d="M8.71 8.71a4 4 0 0 0 5.58 5.58" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm-pass" className="input-label">
                  Confirm Password
                </label>
                <div className="input-box-wrapper">
                  <span className="input-icon" aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="reg-confirm-pass"
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="glass-input has-left-icon has-right-icon"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    aria-label={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                    title={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegConfirmPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2 2l20 20" />
                        <path d="M8.71 8.71a4 4 0 0 0 5.58 5.58" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="button sage-btn full" disabled={busy}>
                {busy ? 'Creating account…' : 'Register as Customer'} <span aria-hidden="true">→</span>
              </button>
            </form>

            <div className="auth-toggle-prompt">
              <span>Already have an account?</span>{' '}
              <button
                type="button"
                className="link-btn highlight"
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
