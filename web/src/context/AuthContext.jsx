import { useEffect, useState } from 'react'
import { authApi } from '../api/auth'

import { AuthContext } from './auth-context'

const TOKEN_KEY = 'pms_auth_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(window.localStorage.getItem(TOKEN_KEY)))
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    let active = true

    if (!token) return undefined

    authApi
      .me(token)
      .then(({ user: currentUser }) => {
        if (active) {
          setUser(currentUser)
          setSessionError('')
        }
      })
      .catch((error) => {
        if (!active) return

        setUser(null)
        if (error.status === 401) {
          window.localStorage.removeItem(TOKEN_KEY)
          setToken(null)
        } else {
          setSessionError(error.message)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [token])

  const login = async (credentials) => {
    const result = await authApi.login(credentials)
    window.localStorage.setItem(TOKEN_KEY, result.token)
    setToken(result.token)
    setUser(result.user)
    setSessionError('')
  }

  const register = (details) => authApi.register(details)

  const logout = async () => {
    let logoutError = null

    try {
      if (token) await authApi.logout(token)
    } catch (error) {
      logoutError = error.message
    } finally {
      window.localStorage.removeItem(TOKEN_KEY)
      setToken(null)
      setUser(null)
    }

    return logoutError
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        sessionError,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
