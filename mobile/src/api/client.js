import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = 'https://project-management-api-jlmm.onrender.com/api';
export const TOKEN_KEY = 'auth_token';
export const NETWORK_ERROR_MESSAGE =
  'Unable to connect to the server. Please check your internet connection.';

let sessionExpirationHandler;

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const setSessionExpirationHandler = (handler) => {
  sessionExpirationHandler = handler;
};

const statusMessage = (status) => {
  if (status === 400) return 'Please check the information and try again.';
  if (status === 401) return 'Invalid email or password.';
  if (status === 404) return 'The requested item could not be found.';
  if (status >= 500) return 'The server could not complete your request. Please try again.';
  return 'The request could not be completed. Please try again.';
};

export async function request(path, options = {}) {
  const { skipAuthExpiration = false, ...fetchOptions } = options;
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const headers = {
    Accept: 'application/json',
    ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...fetchOptions, headers });
  } catch {
    throw new ApiError(NETWORK_ERROR_MESSAGE);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (response.status === 401 && token && !skipAuthExpiration) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    sessionExpirationHandler?.();
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  if (!response.ok) {
    throw new ApiError(body?.message || statusMessage(response.status), response.status, body?.errors);
  }

  return body;
}

export const postJson = (path, body, options = {}) =>
  request(path, { ...options, method: 'POST', body: JSON.stringify(body) });

export const putJson = (path, body) =>
  request(path, { method: 'PUT', body: JSON.stringify(body) });
