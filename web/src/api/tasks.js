import { apiRequest } from './client'

export const tasksApi = {
  listByProject(token, projectId) {
    return apiRequest(`/projects/${projectId}/tasks`, { token })
  },

  create(token, projectId, task) {
    return apiRequest(`/projects/${projectId}/tasks`, {
      method: 'POST',
      token,
      body: JSON.stringify(task),
    })
  },

  update(token, taskId, task) {
    return apiRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(task),
    })
  },

  remove(token, taskId) {
    return apiRequest(`/tasks/${taskId}`, {
      method: 'DELETE',
      token,
    })
  },
}
