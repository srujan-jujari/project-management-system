import { apiRequest } from './client'

export const authApi = {
  login(credentials) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  register(details) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(details),
    })
  },

  me(token) {
    return apiRequest('/auth/me', { token })
  },

  logout(token) {
    return apiRequest('/auth/logout', {
      method: 'POST',
      token,
    })
  },
}
