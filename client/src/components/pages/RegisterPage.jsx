import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../atoms/Input.jsx'
import Button from '../atoms/Button.jsx'
import StatusMessage from '../molecules/StatusMessage.jsx'
import DemoNotice from '../DemoNotice.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { hasErrors, validateRegistration } from '../../lib/validation.js'

const FIELD_ORDER = ['name', 'email', 'password', 'confirmPassword']

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  function focusFirstError(found) {
    const first = FIELD_ORDER.find((field) => found[field])
    if (first) document.getElementById(`register-${first}`)?.focus()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    const found = validateRegistration(form)
    setErrors(found)
    if (hasErrors(found)) {
      focusFirstError(found)
      return
    }

    setSubmitting(true)
    try {
      // The server hashes the password; it is never stored in the browser.
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrors(error.fields || {})
      setFormError(error.message)
      focusFirstError(error.fields || {})
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="register-title">
        <p className="auth-brand">CoLogger</p>
        <h1 id="register-title">Create an account</h1>
        <p className="muted">Start logging your collections.</p>

        <DemoNotice />

        {formError && <StatusMessage variant="error">{formError}</StatusMessage>}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="register-name"
            label="Name"
            autoComplete="name"
            value={form.name}
            onChange={update('name')}
            error={errors.name}
            maxLength={80}
            required
          />

          <Input
            id="register-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            required
          />

          <Input
            id="register-password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            hint="At least 8 characters."
            required
          />

          <Input
            id="register-confirmPassword"
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            error={errors.confirmPassword}
            required
          />

          <Button type="submit" className="button-block" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Register'}
          </Button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  )
}
