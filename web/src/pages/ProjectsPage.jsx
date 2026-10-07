import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import ProjectFormModal from '../components/ProjectFormModal'
import { projectsApi } from '../api/projects'
import { useAuth } from '../context/useAuth'
import './ProjectsPage.css'

const STATUS_LABELS = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProjectsPage() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [canRetryLoad, setCanRetryLoad] = useState(false)
  const [modalProject, setModalProject] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    projectsApi
      .list(token)
      .then((result) => {
        if (active) {
          setProjects(result.projects)
          setError('')
          setCanRetryLoad(false)
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message)
          setCanRetryLoad(true)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [token, reloadKey])

  const retryLoadProjects = () => {
    setError('')
    setCanRetryLoad(false)
    setLoading(true)
    setReloadKey((current) => current + 1)
  }

  const openCreateModal = () => {
    setModalProject(null)
    setShowModal(true)
  }

  const openEditModal = (project) => {
    setModalProject(project)
    setShowModal(true)
  }

  const saveProject = async (payload) => {
    if (modalProject) {
      const result = await projectsApi.update(token, modalProject.id, payload)
      setProjects((current) =>
        current.map((project) => (project.id === result.project.id ? result.project : project)),
      )
    } else {
      const result = await projectsApi.create(token, payload)
      setProjects((current) => [result.project, ...current])
    }
  }

  const deleteProject = async (project) => {
    const confirmed = window.confirm(`Delete "${project.name}"? This action cannot be undone.`)
    if (!confirmed) return

    setDeletingId(project.id)
    setError('')
    setCanRetryLoad(false)
    try {
      await projectsApi.remove(token, project.id)
      setProjects((current) => current.filter((item) => item.id !== project.id))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingId(null)
    }
  }

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
    <main className="dashboard-shell projects-shell">
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
          <Link className="sidebar-link" to="/dashboard">
            <span className="nav-icon nav-icon--grid" aria-hidden="true" />
            Overview
          </Link>
          <Link className="sidebar-link sidebar-link--active" to="/projects" aria-current="page">
            <span className="nav-icon nav-icon--projects" aria-hidden="true">▦</span>
            Projects
          </Link>
          <p className="sidebar-section-label sidebar-section-label--lower">YOUR SPACE</p>
          <div className="sidebar-note">
            <span className="sidebar-note-mark" aria-hidden="true">✳</span>
            <span>Keep your work moving, one step at a time.</span>
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
            <Link to="/dashboard">Workspace</Link>
            <span className="breadcrumb-divider">/</span>
            <strong>Projects</strong>
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

        <div className="projects-content">
          <header className="projects-heading">
            <div>
              <p className="eyebrow">YOUR WORKSPACE</p>
              <h1>Projects</h1>
              <p>Keep the work that matters organized and moving forward.</p>
            </div>
            <button className="project-primary-button projects-create-button" type="button" onClick={openCreateModal}>
              <span aria-hidden="true">＋</span>
              Create Project
            </button>
          </header>

          {error && (
            <div className="projects-error" role="alert">
              <span>{error}</span>
              {canRetryLoad && (
                <button className="project-secondary-button" type="button" onClick={retryLoadProjects}>
                  Try again
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="projects-loading" role="status">
              <span className="loading-spinner" />
              <span>Loading your projects...</span>
            </div>
          ) : error && projects.length === 0 ? null : projects.length === 0 ? (
            <section className="projects-empty">
              <div className="empty-illustration" aria-hidden="true">
                <span className="empty-illustration-card empty-illustration-card--back" />
                <span className="empty-illustration-card empty-illustration-card--front">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="empty-illustration-plus">＋</span>
              </div>
              <p className="eyebrow">A PLACE TO BEGIN</p>
              <h2>Your next project starts here</h2>
              <p>Create a project to give your goals a home and your plans some shape.</p>
              <button className="project-primary-button" type="button" onClick={openCreateModal}>
                Create your first project
              </button>
            </section>
          ) : (
            <section className="project-list-section" aria-label="Your projects">
              <div className="project-list-heading">
                <h2>All projects <span>{projects.length}</span></h2>
                <span className="project-sort-label">Newest first</span>
              </div>
              <div className="project-grid">
                {projects.map((project) => (
                  <article className="project-card" key={project.id}>
                    <div className="project-card-top">
                      <span className={`project-status project-status--${project.status.toLowerCase()}`}>
                        <i />
                        {STATUS_LABELS[project.status] || project.status}
                      </span>
                      <div className="project-actions">
                        <button type="button" onClick={() => openEditModal(project)} aria-label={`Edit ${project.name}`}>
                          Edit
                        </button>
                        <button
                          className="project-delete-action"
                          type="button"
                          onClick={() => deleteProject(project)}
                          disabled={deletingId === project.id}
                          aria-label={`Delete ${project.name}`}
                        >
                          {deletingId === project.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                    <h3>{project.name}</h3>
                    <p className={`project-description${project.description ? '' : ' project-description--empty'}`}>
                      {project.description || 'No description added yet.'}
                    </p>
                    <div className="project-card-dates">
                      <div>
                        <span>START DATE</span>
                        <strong>{formatDate(project.startDate)}</strong>
                      </div>
                      <div>
                        <span>END DATE</span>
                        <strong>{formatDate(project.endDate)}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      {showModal && (
        <ProjectFormModal
          project={modalProject}
          onClose={() => setShowModal(false)}
          onSubmit={saveProject}
        />
      )}
    </main>
  )
}
