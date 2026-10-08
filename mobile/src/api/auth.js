import { postJson, request, TOKEN_KEY } from './client';
import * as SecureStore from 'expo-secure-store';

export const login = (credentials) =>
  postJson('/auth/login', credentials, { skipAuthExpiration: true });

export const register = (details) =>
  postJson('/auth/register', details, { skipAuthExpiration: true });

export const getCurrentUser = () => request('/auth/me');

export const logout = () => request('/auth/logout', { method: 'POST' });

export const saveToken = (token) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const removeToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);
