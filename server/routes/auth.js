// Registration, login, logout and "who am I".
//
// Passwords are hashed with bcrypt (cost 10) and never stored, logged or sent
// back. Login answers "Incorrect email or password" whether the email or the
// password was wrong, so the form cannot be used to discover who has an account.

import { Router } from 'express'
import bcrypt from 'bcryptjs'
import * as users from '../repos/users.js'
import * as sessions from '../repos/sessions.js'
import { requireAuth } from '../middleware/auth.js'
import {
  hasErrors,
  sendValidationErrors,
  validateLogin,
  validateRegistration,
} from '../validation.js'

const BCRYPT_COST = 10

// Used when the email is unknown, so a failed login takes the same time
// whether or not the account exists.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_COST)

export function authRouter(pool) {
  const router = Router()

  router.post('/register', async (request, response, next) => {
    const { errors, value } = validateRegistration(request.body ?? {})
    if (hasErrors(errors)) return sendValidationErrors(response, errors)

    try {
      if (await users.findByEmail(pool, value.email)) {
        return sendValidationErrors(response, {
          email: 'An account with this email already exists.',
        })
      }

      const passwordHash = await bcrypt.hash(value.password, BCRYPT_COST)
      const user = await users.create(pool, {
        name: value.name,
        email: value.email,
        passwordHash,
      })
      const token = await sessions.create(pool, user.id)
      response.status(201).json({ user: users.toPublicUser(user), token })
    } catch (error) {
      // Two registrations for the same email at the same moment: the unique
      // index catches the second one.
      if (error.code === '23505') {
        return sendValidationErrors(response, {
          email: 'An account with this email already exists.',
        })
      }
      next(error)
    }
  })

  router.post('/login', async (request, response, next) => {
    const { errors, value } = validateLogin(request.body ?? {})
    if (hasErrors(errors)) return sendValidationErrors(response, errors)

    try {
      const user = await users.findByEmail(pool, value.email)
      const passwordMatches = await bcrypt.compare(
        value.password,
        user ? user.password_hash : DUMMY_HASH
      )
      if (!user || !passwordMatches) {
        return response.status(401).json({ error: 'Incorrect email or password.' })
      }

      const token = await sessions.create(pool, user.id)
      response.json({ user: users.toPublicUser(user), token })
    } catch (error) {
      next(error)
    }
  })

  router.post('/logout', requireAuth(pool), async (request, response, next) => {
    try {
      await sessions.remove(pool, request.sessionToken)
      response.status(204).end()
    } catch (error) {
      next(error)
    }
  })

  router.get('/me', requireAuth(pool), (request, response) => {
    response.json({ user: users.toPublicUser(request.user) })
  })

  return router
}
