// Login sessions.
//
// The browser receives a long random token and sends it back on every request
// as "Authorization: Bearer <token>". The database stores only the SHA-256 hash
// of that token, so someone reading the sessions table cannot log in with it.

import { createHash, randomBytes } from 'node:crypto'

const SESSION_DAYS = 30

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

// Creates a session and returns the raw token. This is the only moment the raw
// token exists on the server.
export async function create(pool, userId) {
  const token = randomBytes(32).toString('base64url')

  // Housekeeping: drop this user's expired sessions while we are here.
  await pool.query('DELETE FROM sessions WHERE user_id = $1 AND expires_at < now()', [userId])

  await pool.query(
    `INSERT INTO sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + make_interval(days => $3))`,
    [userId, hashToken(token), SESSION_DAYS]
  )
  return token
}

// Returns the user a token belongs to, or null if the token is unknown or expired.
export async function findUser(pool, token) {
  const result = await pool.query(
    `SELECT u.*
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashToken(token)]
  )
  return result.rows[0] ?? null
}

export async function remove(pool, token) {
  await pool.query('DELETE FROM sessions WHERE token_hash = $1', [hashToken(token)])
}
