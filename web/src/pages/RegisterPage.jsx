import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import { useAuth } from '../context/useAuth'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [details, setDetails] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateField = (event) => {
    setDetails((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await register(details)
      navigate('/login', {
        replace: true,
        state: { notice: 'Your account is ready. Sign in to continue.' },
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="GET STARTED"
      title="Create your account"
      description="Set up your workspace and bring your next idea to life."
    >
      {error && <div className="form-error" role="alert">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <FormField
          id="fullName"
          label="Full name"
          value={details.fullName}
          onChange={updateField}
          placeholder="Jordan Lee"
          autoComplete="name"
          minLength={2}
        />
        <FormField
          id="email"
          label="Email address"
          type="email"
          value={details.email}
          onChange={updateField}
          placeholder="you@company.com"
          autoComplete="email"
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          value={details.password}
          onChange={updateField}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          minLength={8}
        />
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
          {!submitting && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
