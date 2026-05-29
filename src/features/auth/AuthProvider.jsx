import { createContext, useContext, useEffect, useState } from 'react'
import { api, login as apiLogin } from '../../api/client'

const AuthContext = createContext(null)
const CURRENT_USER_KEY = 'amylens.currentUser'

function readCurrentUser() {
  try {
    const stored = window.sessionStorage.getItem(CURRENT_USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function writeCurrentUser(user) {
  try {
    if (user) window.sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    else window.sessionStorage.removeItem(CURRENT_USER_KEY)
  } catch {
    // Ignore session storage failures; the backend session remains authoritative.
  }
}

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
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    let active = true

    async function bootstrap() {
      try {
        // Use a manual-fetch here to avoid following backend redirects
        // (which can produce cross-origin requests and CORS errors in dev).
        const res = await fetch('/api/devices', { credentials: 'include', redirect: 'manual' })
        if (active) {
          if (res.status === 200) {
            setIsAuthenticated(true)
            setCurrentUser(readCurrentUser())
          } else {
            setIsAuthenticated(false)
            setCurrentUser(null)
          }
        }
      } catch {
        if (active) {
          setIsAuthenticated(false)
          setCurrentUser(null)
        }
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
      await apiLogin(username, password)
      await api.getAllDevices()
      setIsAuthenticated(true)
      setCurrentUser({ username })
      writeCurrentUser({ username })
    } catch (error) {
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
      setCurrentUser(null)
      writeCurrentUser(null)
    }
  }
  const value = { isAuthenticated, loading, initializing, login, logout, currentUser }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
