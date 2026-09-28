import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Input from '../atoms/Input.jsx'
import Button from '../atoms/Button.jsx'
import StatusMessage from '../molecules/StatusMessage.jsx'
import DemoNotice from '../DemoNotice.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { hasErrors, validateLogin } from '../../lib/validation.js'

export default function LoginPage() {
  const { login, sessionExpired } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Where to go after logging in: the protected page that sent us here, or the dashboard.
  const destination = location.state?.from?.pathname || '/dashboard'

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    const found = validateLogin(form)
    setErrors(found)
    if (hasErrors(found)) return

    setSubmitting(true)
    try {
      await login({ email: form.email.trim(), password: form.password })
      navigate(destination, { replace: true })
    } catch (error) {
      setErrors(error.fields || {})
      setFormError(error.message)
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <p className="auth-brand">CoLogger</p>
        <h1 id="login-title">Log in</h1>
        <p className="muted">Organize and track your personal collections.</p>

        <DemoNotice />

        {sessionExpired && !formError && (
          <StatusMessage variant="notice">Your session ended. Please log in again.</StatusMessage>
        )}
        {formError && <StatusMessage variant="error">{formError}</StatusMessage>}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="login-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            required
          />

          <Input
            id="login-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            required
          />

          <Button type="submit" className="button-block" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Login'}
          </Button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>

        <p className="field-hint demo-credentials">
          Sample data account: <strong>demo@cologger.test</strong> / <strong>cologger-demo</strong>
        </p>
      </section>
    </main>
  )
}
