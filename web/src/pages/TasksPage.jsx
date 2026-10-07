import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import TaskFormModal from '../components/TaskFormModal'
import { projectsApi } from '../api/projects'
import { tasksApi } from '../api/tasks'
import { useAuth } from '../context/useAuth'
import './ProjectsPage.css'
import './TasksPage.css'

const STATUS_LABELS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
}

const PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

const formatDate = (value) => {
  if (!value) return 'No due date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No due date'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TasksPage() {
  const { projectId } = useParams()
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [projectDetailsId, setProjectDetailsId] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loadedTasksProjectId, setLoadedTasksProjectId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [projectError, setProjectError] = useState('')
  const [canRetry, setCanRetry] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [modalTask, setModalTask] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let active = true

    tasksApi
      .listByProject(token, projectId)
      .then((result) => {
        if (active) {
          setTasks(result.tasks)
          setLoadedTasksProjectId(projectId)
          setError('')
          setCanRetry(false)
        }
      })
      .catch((requestError) => {
        if (active) {
          setLoadedTasksProjectId(projectId)
          setError(requestError.message)
          setCanRetry(true)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    projectsApi
      .get(token, projectId)
      .then((result) => {
        if (active) {
          setProject(result.project)
          setProjectDetailsId(projectId)
          setProjectError('')
        }
      })
      .catch((requestError) => {
        if (active) {
          setProjectDetailsId(projectId)
          setProjectError(requestError.message)
        }
      })

    return () => {
      active = false
    }
  }, [projectId, reloadKey, token])

  const retryLoad = () => {
    setError('')
    setProjectError('')
    setCanRetry(false)
    setLoading(true)
    setReloadKey((current) => current + 1)
  }

  const saveTask = async (payload) => {
    if (modalTask) {
      const result = await tasksApi.update(token, modalTask.id, payload)
      setTasks((current) =>
        current.map((task) => (task.id === result.task.id ? result.task : task)),
      )
    } else {
      const result = await tasksApi.create(token, projectId, payload)
      setTasks((current) => [result.task, ...current])
    }
  }

  const openCreateModal = () => {
    setModalTask(null)
    setShowModal(true)
  }

  const openEditModal = (task) => {
    setModalTask(task)
    setShowModal(true)
  }

  const deleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.name}"? This action cannot be undone.`)) return

    setDeletingId(task.id)
    setError('')
    setCanRetry(false)
    try {
      await tasksApi.remove(token, task.id)
      setTasks((current) => current.filter((item) => item.id !== task.id))
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
  const currentProject = projectDetailsId === projectId ? project : null
  const currentProjectError = projectDetailsId === projectId ? projectError : ''
  const pageLoading = loading || loadedTasksProjectId !== projectId
  const currentError = loadedTasksProjectId === projectId ? error : ''
  const currentTasks = loadedTasksProjectId === projectId ? tasks : []
  const projectName = currentProject?.name || `Project ${projectId}`

  return (
    <main className="dashboard-shell tasks-shell">
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
            <Link to="/projects">Projects</Link>
            <span className="breadcrumb-divider">/</span>
            <strong>Tasks</strong>
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

        <div className="tasks-content">
          <header className="tasks-heading">
            <div>
              <Link className="tasks-back-link" to="/projects">← All projects</Link>
              <p className="eyebrow">PROJECT WORKSPACE</p>
              <h1>{projectName}</h1>
              <p>{currentProject?.description || 'Tasks and next steps for this project.'}</p>
              {currentProjectError && <span className="tasks-project-hint">Project details are unavailable.</span>}
            </div>
            <button
              className="project-primary-button tasks-create-button"
              type="button"
              onClick={openCreateModal}
              disabled={pageLoading || Boolean(currentError)}
            >
              <span aria-hidden="true">＋</span>
              Create Task
            </button>
          </header>

          {currentError && (
            <div className="projects-error" role="alert">
              <span>{currentError}</span>
              {canRetry && (
                <button className="project-secondary-button" type="button" onClick={retryLoad}>
                  Try again
                </button>
              )}
            </div>
          )}

          {pageLoading ? (
            <div className="projects-loading" role="status">
              <span className="loading-spinner" />
              <span>Loading tasks...</span>
            </div>
          ) : currentError ? null : currentTasks.length === 0 ? (
            <section className="projects-empty tasks-empty">
              <div className="tasks-empty-icon" aria-hidden="true">✓</div>
              <p className="eyebrow">A CLEAR RUNWAY</p>
              <h2>No tasks yet</h2>
              <p>Add the first task to give this project a clear next step.</p>
              <button className="project-primary-button" type="button" onClick={openCreateModal}>
                Create the first task
              </button>
            </section>
          ) : (
            <section className="tasks-list-section" aria-label={`Tasks for ${projectName}`}>
              <div className="project-list-heading">
                <h2>Tasks <span>{currentTasks.length}</span></h2>
                <span className="project-sort-label">Project tasks</span>
              </div>
              <div className="tasks-list">
                {currentTasks.map((task) => (
                  <article className="task-card" key={task.id}>
                    <div className={`task-check task-check--${task.status.toLowerCase()}`} aria-hidden="true">
                      {task.status === 'COMPLETED' ? '✓' : ''}
                    </div>
                    <div className="task-card-main">
                      <div className="task-title-row">
                        <h2>{task.name}</h2>
                        <span className={`task-status task-status--${task.status.toLowerCase()}`}>
                          {STATUS_LABELS[task.status] || task.status}
                        </span>
                      </div>
                      <p className={`task-description${task.description ? '' : ' task-description--empty'}`}>
                        {task.description || 'No description added.'}
                      </p>
                      <div className="task-meta">
                        <span className={`task-priority task-priority--${task.priority.toLowerCase()}`}>
                          <i /> {PRIORITY_LABELS[task.priority] || task.priority} priority
                        </span>
                        <span className="task-due-date">
                          <span aria-hidden="true">◷</span> {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                    <div className="task-actions">
                      <button type="button" onClick={() => openEditModal(task)} aria-label={`Edit ${task.name}`}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="task-delete-action"
                        onClick={() => deleteTask(task)}
                        disabled={deletingId === task.id}
                        aria-label={`Delete ${task.name}`}
                      >
                        {deletingId === task.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      {showModal && (
        <TaskFormModal
          task={modalTask}
          onClose={() => setShowModal(false)}
          onSubmit={saveTask}
        />
      )}
    </main>
  )
}
