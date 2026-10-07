import { useState } from 'react'

const EMPTY_PROJECT = {
  name: '',
  description: '',
  status: 'NOT_STARTED',
  startDate: '',
  endDate: '',
}

const toDateInputValue = (value) => (value ? String(value).slice(0, 10) : '')
const toFormValues = (project) => {
  if (!project) return EMPTY_PROJECT

  return {
    name: project.name || '',
    description: project.description || '',
    status: project.status || 'NOT_STARTED',
    startDate: toDateInputValue(project.startDate),
    endDate: toDateInputValue(project.endDate),
  }
}

export default function ProjectFormModal({ project, onClose, onSubmit }) {
  const [form, setForm] = useState(() => toFormValues(project))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError('The end date must be on or after the start date.')
      return
    }

    setSaving(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      status: form.status,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    }

    try {
      await onSubmit(payload)
      onClose()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="project-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose()
      }}
    >
      <section
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
      >
        <div className="project-modal-heading">
          <div>
            <p className="eyebrow">{project ? 'PROJECT DETAILS' : 'NEW WORKSPACE'}</p>
            <h2 id="project-modal-title">{project ? 'Edit project' : 'Create a project'}</h2>
            <p>Give your work a name and a little direction.</p>
          </div>
          <button
            className="project-close-button"
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        {error && <div className="project-form-error" role="alert">{error}</div>}

        <form className="project-form" onSubmit={handleSubmit}>
          <label className="project-field project-field--full" htmlFor="project-name">
            <span>Project name <b>*</b></span>
            <input
              id="project-name"
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="e.g. Website refresh"
              maxLength={200}
              required
              autoFocus
            />
          </label>

          <label className="project-field project-field--full" htmlFor="project-description">
            <span>Description <small>Optional</small></span>
            <textarea
              id="project-description"
              name="description"
              value={form.description}
              onChange={updateField}
              placeholder="What are you hoping to accomplish?"
              rows={3}
              maxLength={5000}
            />
          </label>

          <label className="project-field" htmlFor="project-status">
            <span>Status</span>
            <select id="project-status" name="status" value={form.status} onChange={updateField}>
              <option value="NOT_STARTED">Not started</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </label>

          <label className="project-field" htmlFor="project-start-date">
            <span>Start date <small>Optional</small></span>
            <input
              id="project-start-date"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={updateField}
            />
          </label>

          <label className="project-field" htmlFor="project-end-date">
            <span>End date <small>Optional</small></span>
            <input
              id="project-end-date"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={updateField}
            />
          </label>

          <div className="project-form-actions">
            <button className="project-secondary-button" type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="project-primary-button" type="submit" disabled={saving}>
              {saving ? 'Saving...' : project ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
