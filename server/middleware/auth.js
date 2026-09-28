// Protects a route: only requests carrying a valid session token get through.
//
// The client sends   Authorization: Bearer <token>
// and this middleware looks the token up in the sessions table. On success the
// logged-in user is available to the route as request.user.

import * as sessions from '../repos/sessions.js'

export function readBearerToken(request) {
  const header = request.get('authorization') || ''
  const [scheme, token] = header.split(' ')
  return scheme === 'Bearer' && token ? token : null
}

export function requireAuth(pool) {
  return async function authenticate(request, response, next) {
    try {
      const token = readBearerToken(request)
      const user = token ? await sessions.findUser(pool, token) : null
      if (!user) {
        return response.status(401).json({ error: 'Please log in to continue.' })
      }
      request.user = user
      request.sessionToken = token
      next()
    } catch (error) {
      next(error)
    }
  }
}
