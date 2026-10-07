import { apiRequest } from './client'

export const projectsApi = {
  list(token) {
    return apiRequest('/projects', { token })
  },

  create(token, project) {
    return apiRequest('/projects', {
      method: 'POST',
      token,
      body: JSON.stringify(project),
    })
  },

  update(token, projectId, project) {
    return apiRequest(`/projects/${projectId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(project),
    })
  },

  remove(token, projectId) {
    return apiRequest(`/projects/${projectId}`, {
      method: 'DELETE',
      token,
    })
  },
}
