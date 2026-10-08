import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as authApi from '../api/auth';
import { setSessionExpirationHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [startupError, setStartupError] = useState('');

  const expireSession = useCallback(() => {
    setUser(null);
    setSessionExpired(true);
  }, []);

  const restoreSession = useCallback(async () => {
    setStartupError('');
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        setUser(null);
        return;
      }
      const result = await authApi.getCurrentUser();
      setUser(result.user);
      setSessionExpired(false);
    } catch (error) {
      if (error?.status === 401 || error?.status === 404) {
        await authApi.removeToken();
        setUser(null);
      } else {
        setStartupError(error.message || 'Unable to restore your session. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setSessionExpirationHandler(expireSession);
    return () => setSessionExpirationHandler(undefined);
  }, [expireSession]);

  useEffect(() => {
    const timeout = setTimeout(restoreSession, 0);
    return () => clearTimeout(timeout);
  }, [restoreSession]);

  const signIn = useCallback(async (credentials) => {
    const result = await authApi.login(credentials);
    await authApi.saveToken(result.token);
    setUser(result.user);
    setSessionExpired(false);
    setStartupError('');
  }, []);

  const signOut = useCallback(async () => {
    let logoutError;
    try {
      await authApi.logout();
    } catch (error) {
      logoutError = error;
    } finally {
      await authApi.removeToken();
      setUser(null);
      setSessionExpired(false);
    }
    if (logoutError && logoutError.status !== 401) throw logoutError;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      sessionExpired,
      startupError,
      clearSessionExpired: () => setSessionExpired(false),
      clearStartupError: () => setStartupError(''),
      retrySession: restoreSession,
      signIn,
      signOut,
      setAuthenticatedUser: (nextUser) => setUser(nextUser),
    }),
    [user, isLoading, sessionExpired, startupError, signIn, signOut, restoreSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
