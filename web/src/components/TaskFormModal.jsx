import { useState } from 'react'

const toDateInputValue = (value) => (value ? String(value).slice(0, 10) : '')

const toFormValues = (task) => ({
  name: task?.name || '',
  description: task?.description || '',
  priority: task?.priority || 'MEDIUM',
  status: task?.status || 'PENDING',
  dueDate: toDateInputValue(task?.dueDate),
})

export default function TaskFormModal({ task, onClose, onSubmit }) {
  const [form, setForm] = useState(() => toFormValues(task))
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

    if (!form.name.trim()) {
      setError('Enter a task name to continue.')
      return
    }

    setSaving(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate || null,
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
        aria-labelledby="task-modal-title"
      >
        <div className="project-modal-heading">
          <div>
            <p className="eyebrow">{task ? 'TASK DETAILS' : 'ADD TO YOUR PROJECT'}</p>
            <h2 id="task-modal-title">{task ? 'Edit task' : 'Create a task'}</h2>
            <p>Capture the next step and keep the work moving.</p>
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
          <label className="project-field project-field--full" htmlFor="task-name">
            <span>Task name <b>*</b></span>
            <input
              id="task-name"
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="e.g. Review the first draft"
              maxLength={200}
              required
              autoFocus
            />
          </label>

          <label className="project-field project-field--full" htmlFor="task-description">
            <span>Description <small>Optional</small></span>
            <textarea
              id="task-description"
              name="description"
              value={form.description}
              onChange={updateField}
              placeholder="Add a few details about this task"
              rows={3}
              maxLength={5000}
            />
          </label>

          <label className="project-field" htmlFor="task-priority">
            <span>Priority</span>
            <select id="task-priority" name="priority" value={form.priority} onChange={updateField}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </label>

          <label className="project-field" htmlFor="task-status">
            <span>Status</span>
            <select id="task-status" name="status" value={form.status} onChange={updateField}>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </label>

          <label className="project-field project-field--full" htmlFor="task-due-date">
            <span>Due date <small>Optional</small></span>
            <input
              id="task-due-date"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={updateField}
            />
          </label>

          <div className="project-form-actions">
            <button className="project-secondary-button" type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="project-primary-button" type="submit" disabled={saving}>
              {saving ? 'Saving...' : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
