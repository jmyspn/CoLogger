// Where the browser keeps its login token between visits.
//
// The token is a random string issued by the server at login. It is not the
// password and cannot be turned back into one. It is kept in localStorage so a
// refresh or a new tab stays logged in; README "Authentication" describes the
// trade-off. Only the api/ files use this module.

const TOKEN_KEY = 'cologger:token'

// The Week 1 prototype stored a fake user and session under these keys. They
// are no longer used, so remove them from browsers that still have them.
const LEGACY_KEYS = ['cologgerDemoUser', 'cologgerDemoSession']

function safely(action, fallback = null) {
  try {
    return action()
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). Behave as
    // "not logged in" rather than crashing.
    return fallback
  }
}

safely(() => LEGACY_KEYS.forEach((key) => localStorage.removeItem(key)))

export function getToken() {
  return safely(() => localStorage.getItem(TOKEN_KEY))
}

export function setToken(token) {
  safely(() => localStorage.setItem(TOKEN_KEY, token))
}

export function clearToken() {
  safely(() => localStorage.removeItem(TOKEN_KEY))
}
