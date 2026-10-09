// The real backend: every function here calls the CoLogger Express API.
//
// mockApi.js provides exactly the same functions for demo mode. index.js picks
// one of the two at build time; components never import either file directly.

import { ApiError, SESSION_EXPIRED_EVENT } from './errors.js'
import { clearToken, getToken, setToken } from './tokenStore.js'

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function request(path, { method = 'GET', body } = {}) {
  const token = getToken()
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    // fetch only throws when no response arrived at all.
    throw new ApiError(
      'Could not reach the CoLogger server. Check your connection and try again. ' +
        '(A free-tier server can take up to a minute to wake up.)',
      0
    )
  }

  if (response.status === 204) return null

  let data = null
  try {
    data = await response.json()
  } catch {
    // Not JSON (for example an HTML error page from a proxy).
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      // The saved token was rejected: expired, or logged out elsewhere.
      clearToken()
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }
    throw new ApiError(
      data?.error || `Request failed (${response.status} ${response.statusText})`,
      response.status,
      data?.fields || {}
    )
  }

  return data
}

// ---- Authentication -------------------------------------------------------

export async function register(input) {
  const result = await request('/api/auth/register', { method: 'POST', body: input })
  setToken(result.token)
  return result.user
}

export async function login(input) {
  const result = await request('/api/auth/login', { method: 'POST', body: input })
  setToken(result.token)
  return result.user
}

export async function logout() {
  try {
    if (getToken()) await request('/api/auth/logout', { method: 'POST' })
  } finally {
    // Forget the token locally even if the server could not be reached.
    clearToken()
  }
}

// Returns the logged-in user, or null when there is no saved login.
export async function getCurrentUser() {
  if (!getToken()) return null
  try {
    const result = await request('/api/auth/me')
    return result.user
  } catch (error) {
    if (error.status === 401) return null
    throw error
  }
}

// ---- Collections ----------------------------------------------------------

export const listCollections = () => request('/api/collections')

export const getCollection = (id) => request(`/api/collections/${encodeURIComponent(id)}`)

export const createCollection = (input) =>
  request('/api/collections', { method: 'POST', body: input })

export const updateCollection = (id, input) =>
  request(`/api/collections/${encodeURIComponent(id)}`, { method: 'PUT', body: input })

export const deleteCollection = (id) =>
  request(`/api/collections/${encodeURIComponent(id)}`, { method: 'DELETE' })

// ---- Items ----------------------------------------------------------------

export const listCollectionItems = (collectionId) =>
  request(`/api/collections/${encodeURIComponent(collectionId)}/items`)

export const createItem = (collectionId, input) =>
  request(`/api/collections/${encodeURIComponent(collectionId)}/items`, {
    method: 'POST',
    body: input,
  })

export const getItem = (id) => request(`/api/items/${encodeURIComponent(id)}`)

export const updateItem = (id, input) =>
  request(`/api/items/${encodeURIComponent(id)}`, { method: 'PUT', body: input })

export const setItemFavorite = (id, isFavorite) =>
  request(`/api/items/${encodeURIComponent(id)}/favorite`, {
    method: 'PATCH',
    body: { isFavorite },
  })

export const deleteItem = (id) =>
  request(`/api/items/${encodeURIComponent(id)}`, { method: 'DELETE' })

export const searchItems = (text) =>
  request(`/api/items?search=${encodeURIComponent(text)}`)

export const listFavorites = () => request('/api/items/favorites')

// ---- Dashboard ------------------------------------------------------------



export const getDashboard = () => request('/api/dashboard')
