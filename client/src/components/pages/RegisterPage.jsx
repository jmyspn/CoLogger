import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../atoms/Input.jsx'
import Button from '../atoms/Button.jsx'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const demoUser = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
    }

    localStorage.setItem('cologgerDemoUser', JSON.stringify(demoUser))

    navigate('/login')
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>CoLogger</h1>
        <p>Create your demo account.</p>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            id="register-name"
            label="Name"
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
            required
          />

          <Input
            id="register-email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            required
          />

          <Input
            id="register-password"
            label="Password"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            required
          />

          <Input
            id="register-confirm-password"
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={(event) =>
              setForm({ ...form, confirmPassword: event.target.value })
            }
            required
          />

          <Button type="submit">
            Register
          </Button>
        </form>

        <p>
          Already have an account?{' '}
          <a href="/login">Login</a>
        </p>
      </section>
    </main>
  )
}