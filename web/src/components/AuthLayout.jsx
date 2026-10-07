import BrandMark from './BrandMark'

export default function AuthLayout({ children, eyebrow, title, description }) {
  return (
    <main className="auth-shell">
      <section className="auth-story">
        <div className="story-topline">
          <BrandMark />
          <span className="story-badge">WORK, IN FOCUS</span>
        </div>

        <div className="story-copy">
          <p className="eyebrow">A clearer way to move forward</p>
          <h1>Make room for your best work.</h1>
          <p className="story-description">
            Bring your team&apos;s plans and priorities into one calm, considered
            workspace.
          </p>
        </div>

        <div className="workspace-art" aria-hidden="true">
          <div className="art-orbit art-orbit--outer" />
          <div className="art-orbit art-orbit--inner" />
          <div className="art-spark art-spark--one" />
          <div className="art-spark art-spark--two" />
          <div className="art-card">
            <div className="art-card-header">
              <span className="art-window-dots">
                <i />
                <i />
                <i />
              </span>
              <span className="art-card-label">YOUR WORKSPACE</span>
            </div>
            <div className="art-card-body">
              <div className="art-line art-line--long" />
              <div className="art-line art-line--short" />
              <div className="art-progress-row">
                <span className="art-progress-icon">✓</span>
                <span className="art-progress-line" />
                <span className="art-progress-pill" />
              </div>
              <div className="art-progress-row art-progress-row--muted">
                <span className="art-progress-icon">·</span>
                <span className="art-progress-line" />
                <span className="art-progress-pill" />
              </div>
            </div>
          </div>
          <div className="art-note">
            <span className="art-note-check">✓</span>
            <span>One step at a time</span>
          </div>
        </div>

        <p className="story-footer">Thoughtful work starts with a little clarity.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-mobile-brand">
          <BrandMark compact />
        </div>
        <div className="auth-card">
          <div className="auth-heading">
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          {children}
          <div className="auth-legal">
            <span>© 2026 Pivotal</span>
            <span className="legal-dot" />
            <span>Built for better collaboration</span>
          </div>
        </div>
      </section>
    </main>
  )
}
