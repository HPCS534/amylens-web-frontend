import { createContext, useContext, useEffect, useState } from 'react'
import { api, login as apiLogin } from '../../api/client'
import { getDevPassword } from './passwordResetState'

const AuthContext = createContext(null)

export function useAuth() {
  return (
    useContext(AuthContext) ?? {
      isAuthenticated: false,
      loading: false,
      initializing: false,
      login: async () => {},
      logout: async () => {},
    }
  )
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let active = true

    async function bootstrap() {
      try {
        await api.getAllDevices()
        if (active) setIsAuthenticated(true)
      } catch {
        if (active) setIsAuthenticated(false)
      } finally {
        if (active) setInitializing(false)
      }
    }

    bootstrap()
    return () => {
      active = false
    }
  }, [])

  async function login(username, password) {
    setLoading(true)
    try {
      if (import.meta.env.DEV && username === 'admin' && password === getDevPassword()) {
        setIsAuthenticated(true)
        return
      }

      await apiLogin(username, password)
      // verify by calling a protected endpoint
      await api.getAllDevices()
      setIsAuthenticated(true)
    } catch (error) {
      if (import.meta.env.DEV && username === 'admin' && password === getDevPassword()) {
        setIsAuthenticated(true)
        return
      }

      if (import.meta.env.DEV) {
        console.warn('AmyLens backend login is unavailable in dev; enabling demo mode.', error)
        throw error
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    try {
      await api.logout()
    } catch {
      // ignore server logout failures; clear client state regardless
    } finally {
      setIsAuthenticated(false)
    }
  }

  const value = { isAuthenticated, loading, initializing, login, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
