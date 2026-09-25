import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../atoms/Input.jsx'
import Button from '../atoms/Button.jsx'

export default function LoginPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const savedUser = localStorage.getItem('cologgerDemoUser')

    if (!savedUser) {
      setError('No demo account found. Please register first.')
      return
    }

    const demoUser = JSON.parse(savedUser)

    if (form.email.trim().toLowerCase() !== demoUser.email) {
      setError('Email does not match the registered demo account.')
      return
    }

    localStorage.setItem(
      'cologgerDemoSession',
      JSON.stringify({
        name: demoUser.name,
        email: demoUser.email,
      })
    )

    navigate('/dashboard')
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>CoLogger</h1>
        <p>Login to your demo account.</p>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            id="login-email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            required
          />

          <Input
            id="login-password"
            label="Password"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            required
          />

          <Button type="submit">
            Login
          </Button>
        </form>

        <p>
          Don&apos;t have an account?{' '}
          <a href="/register">Register</a>
        </p>
      </section>
    </main>
  )
}