// /api/items: one item by id, search, update, favorite, delete.
// (Listing and creating items happen under /api/collections/:id/items.)

import { Router } from 'express'
import * as items from '../repos/items.js'
import { hasErrors, parseId, sendValidationErrors, validateItem } from '../validation.js'

const NOT_FOUND = { error: 'Item not found.' }

export function itemsRouter(pool) {
  const router = Router()

  // GET /api/items?search=casio  searches the names of all your items.
  router.get('/', async (request, response, next) => {
    const text = typeof request.query.search === 'string' ? request.query.search.trim() : ''
    if (!text) return response.json([])
    if (text.length > 100) return response.status(400).json({ error: 'Search is too long.' })

    try {
      response.json(await items.search(pool, request.user.id, text))
    } catch (error) {
      next(error)
    }
  })

  router.get('/:id', async (request, response, next) => {
    const id = parseId(request.params.id)
    if (!id) return response.status(404).json(NOT_FOUND)

    try {
      const item = await items.getForUser(pool, request.user.id, id)
      if (!item) return response.status(404).json(NOT_FOUND)
      response.json(item)
    } catch (error) {
      next(error)
    }
  })

  router.put('/:id', async (request, response, next) => {
    const id = parseId(request.params.id)
    if (!id) return response.status(404).json(NOT_FOUND)

    const { errors, value } = validateItem(request.body ?? {})
    if (hasErrors(errors)) return sendValidationErrors(response, errors)

    try {
      const item = await items.update(pool, request.user.id, id, value)
      if (!item) return response.status(404).json(NOT_FOUND)
      response.json(item)
    } catch (error) {
      next(error)
    }
  })

  // A small dedicated route so the heart button does not have to resend the
  // whole item (including its image) just to flip one boolean.
  router.patch('/:id/favorite', async (request, response, next) => {
    const id = parseId(request.params.id)
    if (!id) return response.status(404).json(NOT_FOUND)

    const isFavorite = request.body?.isFavorite
    if (typeof isFavorite !== 'boolean') {
      return sendValidationErrors(response, { isFavorite: 'Favorite must be true or false.' })
    }

    try {
      const item = await items.setFavorite(pool, request.user.id, id, isFavorite)
      if (!item) return response.status(404).json(NOT_FOUND)
      response.json(item)
    } catch (error) {
      next(error)
    }
  })

  router.delete('/:id', async (request, response, next) => {
    const id = parseId(request.params.id)
    if (!id) return response.status(404).json(NOT_FOUND)

    try {
      const removed = await items.remove(pool, request.user.id, id)
      if (!removed) return response.status(404).json(NOT_FOUND)
      response.status(204).end()
    } catch (error) {
      next(error)
    }
  })

  return router
}
