import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import { useAuth } from '../context/useAuth'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    const logoutError = await logout()
    navigate('/login', {
      replace: true,
      state: logoutError
        ? { notice: `You have been signed out on this device. ${logoutError}` }
        : undefined,
    })
  }

  const firstName = user?.fullName?.trim().split(/\s+/)[0] || 'there'

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <BrandMark compact />
        <div className="sidebar-workspace">
          <span className="workspace-avatar">{firstName.charAt(0).toUpperCase()}</span>
          <span className="workspace-label">
            <strong>My workspace</strong>
            <small>Personal space</small>
          </span>
          <span className="workspace-chevron" aria-hidden="true">⌄</span>
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <p className="sidebar-section-label">WORKSPACE</p>
          <Link className="sidebar-link sidebar-link--active" to="/dashboard">
            <span className="nav-icon nav-icon--grid" aria-hidden="true" />
            Overview
          </Link>
          <Link className="sidebar-link" to="/projects">
            <span className="nav-icon nav-icon--projects" aria-hidden="true">▦</span>
            Projects
          </Link>
          <p className="sidebar-section-label sidebar-section-label--lower">YOUR SPACE</p>
          <div className="sidebar-note">
            <span className="sidebar-note-mark" aria-hidden="true">✳</span>
            <span>Your workspace is ready for what&apos;s next.</span>
          </div>
        </nav>
        <div className="sidebar-account">
          <span className="account-avatar">{firstName.charAt(0).toUpperCase()}</span>
          <span className="account-copy">
            <strong>{user?.fullName}</strong>
            <small>{user?.email}</small>
          </span>
          <button
            className="logout-icon-button"
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Sign out"
            title="Sign out"
          >
            ↗
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>Overview</strong>
          </div>
          <button
            className="text-button"
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Signing out...' : 'Sign out'}
            <span aria-hidden="true">↗</span>
          </button>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-welcome">
            <div>
              <p className="eyebrow">YOUR HOME BASE</p>
              <h1>Good to have you here, {firstName}.</h1>
              <p className="welcome-description">
                Your account is set up. This space will grow with the work you bring to it.
              </p>
            </div>
            <div className="welcome-orb" aria-hidden="true">
              <span className="orb-ring orb-ring--one" />
              <span className="orb-ring orb-ring--two" />
              <span className="orb-center">✳</span>
            </div>
          </div>

          <section className="getting-started-card">
            <div className="getting-started-icon" aria-hidden="true">
              <span>✦</span>
            </div>
            <div className="getting-started-copy">
              <p className="eyebrow">A FRESH START</p>
              <h2>Your workspace is ready</h2>
              <p>
                You&apos;re all set. Project and task tools will be available here as
                your workspace takes shape.
              </p>
            </div>
            <div className="getting-started-status">
              <span className="status-indicator" />
              Account active
            </div>
          </section>

          <section className="account-details-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">ACCOUNT</p>
                <h2>Your details</h2>
              </div>
              <span className="account-check" aria-label="Verified">✓</span>
            </div>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Full name</span>
                <span className="detail-value">{user?.fullName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email address</span>
                <span className="detail-value">{user?.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Member since</span>
                <span className="detail-value">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Today'}
                </span>
              </div>
            </div>
          </section>

          <footer className="dashboard-footer">
            <span>Take it one thoughtful step at a time.</span>
            <span className="footer-spark" aria-hidden="true">✳</span>
          </footer>
        </div>
      </section>
    </main>
  )
}
