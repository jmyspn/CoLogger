// Integration tests: the real Express app against the real PostgreSQL database
// named in .env. Run with `npm test` after `npm run db:reset`.
//
// The tests create their own throwaway users (random emails) and delete them
// at the end, so they do not disturb the demo data.

import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { pool } from '../db/pool.js'
import { createApp } from '../app.js'

let server
let baseUrl
const createdEmails = []

async function call(method, path, { token, body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  return { status: response.status, body: text ? JSON.parse(text) : null }
}

async function registerUser(name = 'Tester') {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`
  createdEmails.push(email)
  const { status, body } = await call('POST', '/api/auth/register', {
    body: { name, email, password: 'correct-horse-battery' },
  })
  assert.equal(status, 201)
  return { email, token: body.token, user: body.user }
}

before(async () => {
  const app = createApp({ pool, corsOrigins: ['http://localhost:5173'], authRateLimit: 1000 })
  await new Promise((resolve) => {
    server = app.listen(0, resolve)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  for (const email of createdEmails) {
    await pool.query('DELETE FROM users WHERE email = $1', [email])
  }
  await new Promise((resolve) => server.close(resolve))
  await pool.end()
})

describe('authentication', () => {
  test('register, me, logout, login', async () => {
    const { email, token, user } = await registerUser('Casio Fan')
    assert.equal(user.email, email)
    assert.equal(user.password_hash, undefined)

    const me = await call('GET', '/api/auth/me', { token })
    assert.equal(me.status, 200)
    assert.equal(me.body.user.name, 'Casio Fan')

    assert.equal((await call('POST', '/api/auth/logout', { token })).status, 204)
    assert.equal((await call('GET', '/api/auth/me', { token })).status, 401, 'logout ends the session')

    const wrong = await call('POST', '/api/auth/login', { body: { email, password: 'nope-nope-nope' } })
    assert.equal(wrong.status, 401)

    const login = await call('POST', '/api/auth/login', {
      body: { email: email.toUpperCase(), password: 'correct-horse-battery' },
    })
    assert.equal(login.status, 200)
    assert.ok(login.body.token)
  })

  test('passwords are stored hashed', async () => {
    const { email } = await registerUser()
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE email = $1', [email])
    assert.notEqual(rows[0].password_hash, 'correct-horse-battery')
    assert.match(rows[0].password_hash, /^\$2[aby]\$10\$/)
  })

  test('duplicate email and short password are rejected', async () => {
    const { email } = await registerUser()
    const duplicate = await call('POST', '/api/auth/register', {
      body: { name: 'Again', email, password: 'another-password' },
    })
    assert.equal(duplicate.status, 400)
    assert.ok(duplicate.body.fields.email)

    const short = await call('POST', '/api/auth/register', {
      body: { name: 'Short', email: 'short@example.com', password: '123' },
    })
    assert.equal(short.status, 400)
    assert.ok(short.body.fields.password)
  })

  test('protected routes need a token', async () => {
    assert.equal((await call('GET', '/api/collections')).status, 401)
    assert.equal((await call('GET', '/api/collections', { token: 'made-up' })).status, 401)
  })
})

describe('collections and items', () => {
  test('the Watches / Casio G-Shock scenario', async () => {
    const { token } = await registerUser()

    const empty = await call('GET', '/api/dashboard', { token })
    assert.deepEqual(
      { c: empty.body.totalCollections, i: empty.body.totalItems, f: empty.body.totalFavorites },
      { c: 0, i: 0, f: 0 }
    )

    const created = await call('POST', '/api/collections', { token, body: { name: '  Watches  ' } })
    assert.equal(created.status, 201)
    assert.equal(created.body.name, 'Watches')
    assert.equal(created.body.itemCount, 0)
    const watchesId = created.body.id

    const duplicate = await call('POST', '/api/collections', { token, body: { name: 'watches' } })
    assert.equal(duplicate.status, 400, 'names are unique per user, ignoring case')

    const sneakers = await call('POST', '/api/collections', { token, body: { name: 'Sneakers' } })

    const item = await call('POST', `/api/collections/${watchesId}/items`, {
      token,
      body: { name: 'Casio G-Shock', estimatedValue: '5500', currency: 'PHP', condition: 'New' },
    })
    assert.equal(item.status, 201)
    assert.equal(item.body.collectionId, watchesId)
    assert.equal(item.body.estimatedValue, 5500)
    const itemId = item.body.id

    const watchItems = await call('GET', `/api/collections/${watchesId}/items`, { token })
    assert.deepEqual(watchItems.body.map((row) => row.name), ['Casio G-Shock'])
    const sneakerItems = await call('GET', `/api/collections/${sneakers.body.id}/items`, { token })
    assert.deepEqual(sneakerItems.body, [], 'the item did not leak into another collection')

    const edited = await call('PUT', `/api/items/${itemId}`, {
      token,
      body: { ...item.body, estimatedValue: 6200.5, acquiredDate: '2026-01-15' },
    })
    assert.equal(edited.status, 200)
    assert.equal(edited.body.estimatedValue, 6200.5)
    assert.equal(edited.body.acquiredDate, '2026-01-15')

    const favorited = await call('PATCH', `/api/items/${itemId}/favorite`, { token, body: { isFavorite: true } })
    assert.equal(favorited.body.isFavorite, true)

    const reloaded = await call('GET', `/api/items/${itemId}`, { token })
    assert.equal(reloaded.body.name, 'Casio G-Shock')
    assert.equal(reloaded.body.isFavorite, true)
    assert.equal(reloaded.body.collectionName, 'Watches')

    const dashboard = await call('GET', '/api/dashboard', { token })
    assert.equal(dashboard.body.totalCollections, 2)
    assert.equal(dashboard.body.totalItems, 1)
    assert.equal(dashboard.body.totalFavorites, 1)
    assert.equal(dashboard.body.recentItems[0].id, itemId)

    const search = await call('GET', '/api/items?search=g-sh', { token })
    assert.deepEqual(search.body.map((row) => row.id), [itemId])

    assert.equal((await call('DELETE', `/api/items/${itemId}`, { token })).status, 204)
    assert.equal((await call('GET', `/api/items/${itemId}`, { token })).status, 404)
    const afterDelete = await call('GET', '/api/dashboard', { token })
    assert.equal(afterDelete.body.totalItems, 0)
    assert.equal(afterDelete.body.totalFavorites, 0)
  })

  test('validation rejects bad item input', async () => {
    const { token } = await registerUser()
    const { body: collection } = await call('POST', '/api/collections', { token, body: { name: 'Cards' } })

    const bad = await call('POST', `/api/collections/${collection.id}/items`, {
      token,
      body: {
        name: '   ',
        estimatedValue: '-5',
        purchasePrice: 'abc',
        acquiredDate: '2026-02-30',
        currency: 'XYZ',
        condition: 'Mint-ish',
        image: 'https://example.com/not-a-data-url.png',
      },
    })
    assert.equal(bad.status, 400)
    assert.deepEqual(
      Object.keys(bad.body.fields).sort(),
      ['acquiredDate', 'condition', 'currency', 'estimatedValue', 'image', 'name', 'purchasePrice']
    )

    assert.equal((await call('POST', '/api/collections', { token, body: { name: '' } })).status, 400)
  })

  test('unknown ids are 404, never someone else\'s data', async () => {
    const owner = await registerUser()
    const stranger = await registerUser()
    const { body: collection } = await call('POST', '/api/collections', {
      token: owner.token,
      body: { name: 'Private' },
    })
    const { body: item } = await call('POST', `/api/collections/${collection.id}/items`, {
      token: owner.token,
      body: { name: 'Secret item' },
    })

    for (const path of [`/api/collections/${collection.id}`, `/api/items/${item.id}`]) {
      assert.equal((await call('GET', path, { token: stranger.token })).status, 404)
    }
    assert.equal((await call('DELETE', `/api/items/${item.id}`, { token: stranger.token })).status, 404)
    assert.equal(
      (await call('POST', `/api/collections/${collection.id}/items`, {
        token: stranger.token,
        body: { name: 'Sneaky' },
      })).status,
      404
    )

    for (const path of ['/api/items/999999', '/api/items/abc', '/api/collections/999999', '/api/collections/-1']) {
      assert.equal((await call('GET', path, { token: owner.token })).status, 404, path)
    }
  })

  test('deleting a collection deletes its items', async () => {
    const { token } = await registerUser()
    const { body: collection } = await call('POST', '/api/collections', { token, body: { name: 'Figures' } })
    const { body: item } = await call('POST', `/api/collections/${collection.id}/items`, {
      token,
      body: { name: 'Figure A' },
    })

    const renamed = await call('PUT', `/api/collections/${collection.id}`, {
      token,
      body: { name: 'Action Figures', description: 'Poseable ones' },
    })
    assert.equal(renamed.body.name, 'Action Figures')
    assert.equal(renamed.body.itemCount, 1)

    assert.equal((await call('DELETE', `/api/collections/${collection.id}`, { token })).status, 204)
    assert.equal((await call('GET', `/api/items/${item.id}`, { token })).status, 404)
  })
})
