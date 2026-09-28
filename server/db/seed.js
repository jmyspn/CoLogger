// Reset the database to the demo data.
//
//   npm run db:seed        (or npm run db:reset to create the tables first)
//
// 1. Empties every table (TRUNCATE ... RESTART IDENTITY CASCADE).
// 2. Creates the demo account, hashing its password with bcrypt here in Node,
//    so no password hash is hardcoded in the repository.
// 3. Runs db/seed.sql, which adds the demo account's collections and items.
//
// The demo password is not a secret: it is published in the README so a grader
// can log in. Never reuse it for anything real.

import { readFileSync } from 'node:fs'
import bcrypt from 'bcryptjs'
import { pool } from './pool.js'

export const DEMO_USER = {
  name: 'Demo Collector',
  email: 'demo@cologger.test',
  password: 'cologger-demo',
}

try {
  await pool.query('TRUNCATE TABLE items, collections, sessions, users RESTART IDENTITY CASCADE')

  const passwordHash = await bcrypt.hash(DEMO_USER.password, 10)
  await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
    [DEMO_USER.name, DEMO_USER.email, passwordHash]
  )

  await pool.query(readFileSync(new URL('./seed.sql', import.meta.url), 'utf8'))
  console.log(`seeded demo data (login: ${DEMO_USER.email} / ${DEMO_USER.password})`)
} catch (error) {
  console.error(`seeding failed: ${error.message}`)
  process.exitCode = 1
} finally {
  await pool.end()
}
