// Who is logged in, shared with every component through React context.
//
// This is the only piece of global state in the app. Collections and items are
// NOT kept here: each page fetches what its URL asks for, straight from the API,
// so there is never a second copy of the data to fall out of date.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // 'checking' while we ask the server whether the saved login is still valid,
  // 'ready' once we know, 'unreachable' if the server could not be contacted.
  const [status, setStatus] = useState('checking')
  const [sessionExpired, setSessionExpired] = useState(false)

  const checkSession = useCallback(async () => {
    setStatus('checking')
    try {
      setUser(await api.getCurrentUser())
      setStatus('ready')
    } catch {
      setStatus('unreachable')
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  // The API layer announces a rejected token (expired, or logged out in
  // another tab). Drop the user; RequireAuth then shows the login page.
  useEffect(() => {
    function handleExpired() {
      setUser(null)
      setSessionExpired(true)
    }
    window.addEventListener(api.SESSION_EXPIRED_EVENT, handleExpired)
    return () => window.removeEventListener(api.SESSION_EXPIRED_EVENT, handleExpired)
  }, [])

  const login = useCallback(async (credentials) => {
    const loggedIn = await api.login(credentials)
    setSessionExpired(false)
    setUser(loggedIn)
    return loggedIn
  }, [])

  const register = useCallback(async (details) => {
    const created = await api.register(details)
    setSessionExpired(false)
    setUser(created)
    return created
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } finally {
      setSessionExpired(false)
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, status, sessionExpired, login, register, logout, retry: checkSession }),
    [user, status, sessionExpired, login, register, logout, checkSession]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
