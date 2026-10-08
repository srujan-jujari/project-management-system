import { postJson, putJson, request } from './client';

export const getProjectTasks = (projectId, { search, status, priority } = {}) => {
  const params = new URLSearchParams();
  if (search?.trim()) params.set('search', search.trim());
  if (status) params.set('status', status);
  if (priority) params.set('priority', priority);
  const query = params.toString();
  return request(`/projects/${projectId}/tasks${query ? `?${query}` : ''}`);
};

export const getTask = (taskId) => request(`/tasks/${taskId}`);
export const createTask = (task) => postJson('/tasks', task);
export const updateTask = (taskId, task) => putJson(`/tasks/${taskId}`, task);
export const deleteTask = (taskId) => request(`/tasks/${taskId}`, { method: 'DELETE' });
