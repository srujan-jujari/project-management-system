const API_BASE_URL = 'http://localhost:3000/api'

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new ApiError('Unable to connect to the API. Check that the backend is running.', 0)
  }

  let payload

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const validationMessage = payload?.errors
      ? Object.values(payload.errors).flat().join(' ')
      : null
    throw new ApiError(
      validationMessage || payload?.message || 'The request could not be completed.',
      response.status,
      payload?.errors,
    )
  }

  return payload
}
