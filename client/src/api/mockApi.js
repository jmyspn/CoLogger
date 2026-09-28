// DEMO MODE: a simulated backend that lives in this browser's localStorage.
//
// It exists so the GitHub Pages site works without a server (the template's
// "demo mode"). It is NOT the real application: the real one is the Express API
// and PostgreSQL database that httpApi.js talks to. index.js chooses between
// the two at build time, so only one of them is ever in use.
//
// It implements the same functions, returns the same shapes and fails the same
// way (ApiError with 404 / 400 / 401) as the real API, so pages cannot tell the
// difference.
//
// Storage rules:
//   * Everything is one JSON document under STORAGE_KEY.
//   * Sample data is written ONLY when that key does not exist yet. It never
//     overwrites what the visitor has added, edited or deleted.
//   * Passwords are never stored. A salted SHA-256 hash is kept instead, which
//     is good enough for a demo that only ever runs in the visitor's own
//     browser, and is NOT how the real server does it (bcrypt, see server/).

import { ApiError, SESSION_EXPIRED_EVENT } from './errors.js'
import { clearToken, getToken, setToken } from './tokenStore.js'
import { DEMO_EMAIL, DEMO_PASSWORD, seedCollections, seedItems } from './seedData.js'
import {
  hasErrors,
  validateCollection,
  validateItem,
  validateLogin,
  validateRegistration,
} from '../lib/validation.js'

const STORAGE_KEY = 'cologger:demo-database'
const DAY = 24 * 60 * 60 * 1000

// A real network is not instant; keeping a delay keeps loading states honest.
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms))

async function hashPassword(password, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

function randomString() {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) =>
    b.toString(16).padStart(2, '0')
  ).join('')
}

async function buildSeedDatabase() {
  const now = Date.now()
  const salt = randomString()
  const db = {
    nextId: { users: 2, collections: 1, items: 1 },
    users: [
      {
        id: 1,
        name: 'Demo Collector',
        email: DEMO_EMAIL,
        salt,
        passwordHash: await hashPassword(DEMO_PASSWORD, salt),
      },
    ],
    sessions: [],
    collections: [],
    items: [],
  }

  const idsByKey = {}
  for (const seed of seedCollections) {
    const stamp = new Date(now - seed.daysAgo * DAY).toISOString()
    const id = db.nextId.collections++
    idsByKey[seed.key] = id
    db.collections.push({
      id,
      userId: 1,
      name: seed.name,
      description: seed.description,
      createdAt: stamp,
      updatedAt: stamp,
    })
  }
  for (const { collection, daysAgo, ...fields } of seedItems) {
    const stamp = new Date(now - daysAgo * DAY).toISOString()
    db.items.push({
      id: db.nextId.items++,
      collectionId: idsByKey[collection],
      image: '',
      ...fields,
      createdAt: stamp,
      updatedAt: stamp,
    })
  }
  return db
}

async function load() {
  let stored = null
  try {
    stored = localStorage.getItem(STORAGE_KEY)
  } catch {
    throw new ApiError('This browser is blocking storage, so demo mode cannot save anything.', 0)
  }

  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // Corrupted storage: fall through and start again with the sample data.
    }
  }

  const db = await buildSeedDatabase()
  save(db)
  return db
}

function save(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    throw new ApiError(
      'Browser storage is full. Remove an image or two and try again. ' +
        '(Demo mode stores everything, including images, inside this browser.)',
      507
    )
  }
}

// ---- helpers mirroring the server ----------------------------------------

function requireUser(db) {
  const token = getToken()
  const session = token && db.sessions.find((row) => row.token === token)
  const user = session && db.users.find((row) => row.id === session.userId)
  if (!user) {
    if (token) {
      clearToken()
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }
    throw new ApiError('Please log in to continue.', 401)
  }
  return user
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email }
}

function invalid(fields) {
  return new ApiError('Please fix the highlighted fields.', 400, fields)
}

function toId(raw) {
  return /^[1-9]\d*$/.test(String(raw)) ? Number(raw) : null
}

function ownCollection(db, user, id) {
  const collectionId = toId(id)
  const collection = db.collections.find(
    (row) => row.id === collectionId && row.userId === user.id
  )
  if (!collection) throw new ApiError('Collection not found.', 404)
  return collection
}

function ownItem(db, user, id) {
  const itemId = toId(id)
  const item = db.items.find((row) => row.id === itemId)
  if (!item || !db.collections.some((c) => c.id === item.collectionId && c.userId === user.id)) {
    throw new ApiError('Item not found.', 404)
  }
  return item
}

const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id

function presentCollection(db, collection) {
  const items = db.items.filter((item) => item.collectionId === collection.id).sort(newestFirst)
  const { userId, ...fields } = collection
  return {
    ...fields,
    itemCount: items.length,
    coverImage: items.find((item) => item.image)?.image || '',
  }
}

function presentItem(db, item) {
  const collection = db.collections.find((row) => row.id === item.collectionId)
  return { ...item, collectionName: collection?.name ?? '' }
}

function cleanCollection(input) {
  const errors = validateCollection(input)
  if (hasErrors(errors)) throw invalid(errors)
  return { name: input.name.trim(), description: (input.description || '').trim() }
}

function assertUniqueName(db, user, name, exceptId = null) {
  const taken = db.collections.some(
    (row) =>
      row.userId === user.id &&
      row.id !== exceptId &&
      row.name.toLowerCase() === name.toLowerCase()
  )
  if (taken) throw invalid({ name: 'You already have a collection with this name.' })
}

function money(value) {
  return value === '' || value === null || value === undefined ? null : Number(value)
}

function cleanItem(input) {
  const values = { currency: 'PHP', ...input }
  const errors = validateItem(values)
  if (hasErrors(errors)) throw invalid(errors)
  return {
    name: values.name.trim(),
    image: values.image || '',
    estimatedValue: money(values.estimatedValue),
    currency: values.currency,
    purchasePrice: money(values.purchasePrice),
    acquiredDate: values.acquiredDate || null,
    acquiredFrom: (values.acquiredFrom || '').trim(),
    condition: values.condition || '',
    notes: (values.notes || '').trim(),
    isFavorite: values.isFavorite === true,
  }
}

// ---- Authentication -------------------------------------------------------

async function startSession(db, user) {
  const token = randomString()
  db.sessions.push({ token, userId: user.id })
  save(db)
  setToken(token)
  return publicUser(user)
}

export async function register(input) {
  await delay()
  const db = await load()
  const errors = validateRegistration(input)
  if (hasErrors(errors)) throw invalid(errors)

  const email = input.email.trim().toLowerCase()
  if (db.users.some((user) => user.email === email)) {
    throw invalid({ email: 'An account with this email already exists.' })
  }

  const salt = randomString()
  const user = {
    id: db.nextId.users++,
    name: input.name.trim(),
    email,
    salt,
    passwordHash: await hashPassword(input.password, salt),
  }
  db.users.push(user)
  return startSession(db, user)
}

export async function login(input) {
  await delay()
  const db = await load()
  const errors = validateLogin(input)
  if (hasErrors(errors)) throw invalid(errors)

  const email = input.email.trim().toLowerCase()
  const user = db.users.find((row) => row.email === email)
  const matches = user && (await hashPassword(input.password, user.salt)) === user.passwordHash
  if (!matches) throw new ApiError('Incorrect email or password.', 401)
  return startSession(db, user)
}

export async function logout() {
  const db = await load()
  const token = getToken()
  db.sessions = db.sessions.filter((row) => row.token !== token)
  save(db)
  clearToken()
}

export async function getCurrentUser() {
  if (!getToken()) return null
  await delay()
  const db = await load()
  try {
    return publicUser(requireUser(db))
  } catch {
    return null
  }
}

// ---- Collections ----------------------------------------------------------

export async function listCollections() {
  await delay()
  const db = await load()
  const user = requireUser(db)
  return db.collections
    .filter((row) => row.userId === user.id)
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()) || a.id - b.id)
    .map((row) => presentCollection(db, row))
}

export async function getCollection(id) {
  await delay()
  const db = await load()
  return presentCollection(db, ownCollection(db, requireUser(db), id))
}

export async function createCollection(input) {
  await delay()
  const db = await load()
  const user = requireUser(db)
  const values = cleanCollection(input)
  assertUniqueName(db, user, values.name)

  const now = new Date().toISOString()
  const collection = { id: db.nextId.collections++, userId: user.id, ...values, createdAt: now, updatedAt: now }
  db.collections.push(collection)
  save(db)
  return presentCollection(db, collection)
}

export async function updateCollection(id, input) {
  await delay()
  const db = await load()
  const user = requireUser(db)
  const collection = ownCollection(db, user, id)
  const values = cleanCollection(input)
  assertUniqueName(db, user, values.name, collection.id)

  Object.assign(collection, values, { updatedAt: new Date().toISOString() })
  save(db)
  return presentCollection(db, collection)
}

// Like ON DELETE CASCADE in the real database: the collection's items go too.
export async function deleteCollection(id) {
  await delay()
  const db = await load()
  const collection = ownCollection(db, requireUser(db), id)
  db.collections = db.collections.filter((row) => row.id !== collection.id)
  db.items = db.items.filter((row) => row.collectionId !== collection.id)
  save(db)
  return null
}

// ---- Items ----------------------------------------------------------------

export async function listCollectionItems(collectionId) {
  await delay()
  const db = await load()
  const collection = ownCollection(db, requireUser(db), collectionId)
  return db.items
    .filter((row) => row.collectionId === collection.id)
    .sort(newestFirst)
    .map((row) => presentItem(db, row))
}

export async function createItem(collectionId, input) {
  await delay()
  const db = await load()
  const collection = ownCollection(db, requireUser(db), collectionId)
  const now = new Date().toISOString()
  const item = {
    id: db.nextId.items++,
    collectionId: collection.id, // from the URL, never from the form
    ...cleanItem(input),
    createdAt: now,
    updatedAt: now,
  }
  db.items.push(item)
  save(db)
  return presentItem(db, item)
}

export async function getItem(id) {
  await delay()
  const db = await load()
  return presentItem(db, ownItem(db, requireUser(db), id))
}

export async function updateItem(id, input) {
  await delay()
  const db = await load()
  const item = ownItem(db, requireUser(db), id)
  Object.assign(item, cleanItem(input), { updatedAt: new Date().toISOString() })
  save(db)
  return presentItem(db, item)
}

export async function setItemFavorite(id, isFavorite) {
  await delay()
  const db = await load()
  const item = ownItem(db, requireUser(db), id)
  item.isFavorite = isFavorite === true
  item.updatedAt = new Date().toISOString()
  save(db)
  return presentItem(db, item)
}

export async function deleteItem(id) {
  await delay()
  const db = await load()
  const item = ownItem(db, requireUser(db), id)
  db.items = db.items.filter((row) => row.id !== item.id)
  save(db)
  return null
}

function itemsOwnedBy(db, user) {
  const ids = new Set(db.collections.filter((c) => c.userId === user.id).map((c) => c.id))
  return db.items.filter((item) => ids.has(item.collectionId))
}

export async function searchItems(text) {
  await delay()
  const db = await load()
  const needle = text.trim().toLowerCase()
  if (!needle) return []
  return itemsOwnedBy(db, requireUser(db))
    .filter((item) => item.name.toLowerCase().includes(needle))
    .sort(newestFirst)
    .slice(0, 50)
    .map((item) => presentItem(db, item))
}

// ---- Dashboard ------------------------------------------------------------

export async function getDashboard() {
  await delay()
  const db = await load()
  const user = requireUser(db)
  const items = itemsOwnedBy(db, user)
  return {
    totalCollections: db.collections.filter((c) => c.userId === user.id).length,
    totalItems: items.length,
    totalFavorites: items.filter((item) => item.isFavorite).length,
    recentItems: [...items].sort(newestFirst).slice(0, 6).map((item) => presentItem(db, item)),
  }
}
