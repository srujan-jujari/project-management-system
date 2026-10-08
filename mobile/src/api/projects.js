import { request } from './client';

export const getProjects = ({ search, status } = {}) => {
  const params = new URLSearchParams();
  if (search?.trim()) params.set('search', search.trim());
  if (status) params.set('status', status);
  const query = params.toString();
  return request(`/projects${query ? `?${query}` : ''}`);
};
