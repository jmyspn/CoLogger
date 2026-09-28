// Builds the Express application. server.js starts it; test/api.test.js starts
// its own copy on a random port. Keeping the two apart means the tests exercise
// exactly the same middleware and routes as production.

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { requireAuth } from './middleware/auth.js'
import { authRouter } from './routes/auth.js'
import { collectionsRouter } from './routes/collections.js'
import { itemsRouter } from './routes/items.js'
import { dashboardRouter } from './routes/dashboard.js'

export function createApp({ pool, corsOrigins, trustProxy = false, authRateLimit = 20 }) {
  const app = express()

  // Behind a host's load balancer (Render, Railway...) the visitor's IP arrives
  // in X-Forwarded-For. The rate limiter needs the real IP, not the proxy's.
  if (trustProxy) app.set('trust proxy', 1)

  // Sets a group of protective HTTP headers in one line.
  app.use(helmet())

  // Name the origins that may call this API from a browser. cors() with no
  // options would let any website on the internet call it.
  app.use(cors({ origin: corsOrigins }))

  // Item images travel as data URLs inside the JSON body, so the limit is
  // larger than a plain-text API would need. validation.js caps the image itself.
  app.use(express.json({ limit: '2mb' }))

  app.get('/healthz', (request, response) => {
    response.json({ ok: true })
  })

  app.get('/readyz', async (request, response) => {
    try {
      await pool.query('SELECT 1')
      response.json({ ok: true, db: 'up' })
    } catch (error) {
      console.error('readyz failed:', error.message)
      response.status(503).json({ ok: false, db: 'down' })
    }
  })

  // Slow down password guessing: at most `authRateLimit` login/register
  // attempts per IP address every 15 minutes.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: authRateLimit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
  })
  app.use('/api/auth/login', authLimiter)
  app.use('/api/auth/register', authLimiter)

  app.use('/api/auth', authRouter(pool))

  // Everything below this line requires a logged-in user.
  const authenticate = requireAuth(pool)
  app.use('/api/collections', authenticate, collectionsRouter(pool))
  app.use('/api/items', authenticate, itemsRouter(pool))
  app.use('/api/dashboard', authenticate, dashboardRouter(pool))

  app.use((request, response) => {
    response.status(404).json({ error: 'No such route.' })
  })

  // The details go to the server log; the visitor gets a plain message. A stack
  // trace in a response tells strangers about your files and dependencies.
  app.use((error, request, response, next) => {
    if (error.type === 'entity.too.large') {
      return response.status(413).json({ error: 'That upload is too large. Choose a smaller image.' })
    }
    if (error.type === 'entity.parse.failed') {
      return response.status(400).json({ error: 'The request body was not valid JSON.' })
    }
    console.error(error)
    response.status(500).json({ error: 'Something went wrong on the server.' })
  })

  return app
}
