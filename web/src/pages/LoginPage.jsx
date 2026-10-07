import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import { useAuth } from '../context/useAuth'

export default function LoginPage() {
  const { login, sessionError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(location.state?.notice || '')
  const [submitting, setSubmitting] = useState(false)

  const updateField = (event) => {
    setCredentials((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setSubmitting(true)

    try {
      await login(credentials)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Sign in to Pivotal"
      description="Pick up where you left off. Your workspace is waiting."
    >
      {notice && <div className="form-notice" role="status">{notice}</div>}
      {sessionError && <div className="form-error" role="alert">{sessionError}</div>}
      {error && <div className="form-error" role="alert">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <FormField
          id="email"
          label="Email address"
          type="email"
          value={credentials.email}
          onChange={updateField}
          placeholder="you@company.com"
          autoComplete="email"
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          value={credentials.password}
          onChange={updateField}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
          {!submitting && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <p className="auth-switch">
        New to Pivotal? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  )
}
