// Entry point: `npm run dev` locally, `npm start` on a host.

import { pool } from './db/pool.js'
import { createApp } from './app.js'

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const app = createApp({
  pool,
  corsOrigins,
  // Hosts such as Render put a proxy in front of the app. Locally there is none.
  trustProxy: process.env.NODE_ENV === 'production',
})

// The host chooses the port and passes it in PORT. Hardcoding 3000 is the
// commonest reason a first deploy is marked unhealthy.
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`CoLogger API listening on http://localhost:${port}`)
  console.log(`CORS allows: ${corsOrigins.join(', ')}`)
})
