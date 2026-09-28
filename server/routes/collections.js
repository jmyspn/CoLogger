// /api/collections and the items inside one collection.
// Every route here runs after requireAuth, so request.user is the owner.

import { Router } from 'express'
import * as collections from '../repos/collections.js'
import * as items from '../repos/items.js'
import {
  hasErrors,
  parseId,
  sendValidationErrors,
  validateCollection,
  validateItem,
} from '../validation.js'

const NOT_FOUND = { error: 'Collection not found.' }
const DUPLICATE_NAME = { name: 'You already have a collection with this name.' }

export function collectionsRouter(pool) {
  const router = Router()

  router.get('/', async (request, response, next) => {
    try {
      response.json(await collections.listForUser(pool, request.user.id))
    } catch (error) {
      next(error)
    }
  })

  router.post('/', async (request, response, next) => {
    const { errors, value } = validateCollection(request.body ?? {})
    if (hasErrors(errors)) return sendValidationErrors(response, errors)

    try {
      response.status(201).json(await collections.create(pool, request.user.id, value))
    } catch (error) {
      if (error.code === '23505') return sendValidationErrors(response, DUPLICATE_NAME)
      next(error)
    }
  })

  router.get('/:id', async (request, response, next) => {
    const id = parseId(request.params.id)
    if (!id) return response.status(404).json(NOT_FOUND)

    try {
      const collection = await collections.getForUser(pool, request.user.id, id)
      if (!collection) return response.status(404).json(NOT_FOUND)
      response.json(collection)
    } catch (error) {
      next(error)
    }
  })

  router.put('/:id', async (request, response, next) => {
    const id = parseId(request.params.id)
    if (!id) return response.status(404).json(NOT_FOUND)

    const { errors, value } = validateCollection(request.body ?? {})
    if (hasErrors(errors)) return sendValidationErrors(response, errors)

    try {
      const collection = await collections.update(pool, request.user.id, id, value)
      if (!collection) return response.status(404).json(NOT_FOUND)
      response.json(collection)
    } catch (error) {
      if (error.code === '23505') return sendValidationErrors(response, DUPLICATE_NAME)
      next(error)
    }
  })

  router.delete('/:id', async (request, response, next) => {
    const id = parseId(request.params.id)
    if (!id) return response.status(404).json(NOT_FOUND)

    try {
      const removed = await collections.remove(pool, request.user.id, id)
      if (!removed) return response.status(404).json(NOT_FOUND)
      response.status(204).end()
    } catch (error) {
      next(error)
    }
  })

  router.get('/:id/items', async (request, response, next) => {
    const id = parseId(request.params.id)
    if (!id) return response.status(404).json(NOT_FOUND)

    try {
      // Check the collection first so an unknown id is a 404, not an empty list.
      if (!(await collections.getForUser(pool, request.user.id, id))) {
        return response.status(404).json(NOT_FOUND)
      }
      response.json(await items.listForCollection(pool, request.user.id, id))
    } catch (error) {
      next(error)
    }
  })

  // The new item's collection comes from the URL, never from the request body.
  router.post('/:id/items', async (request, response, next) => {
    const id = parseId(request.params.id)
    if (!id) return response.status(404).json(NOT_FOUND)

    const { errors, value } = validateItem(request.body ?? {})
    if (hasErrors(errors)) return sendValidationErrors(response, errors)

    try {
      const item = await items.create(pool, request.user.id, id, value)
      if (!item) return response.status(404).json(NOT_FOUND)
      response.status(201).json(item)
    } catch (error) {
      next(error)
    }
  })

  return router
}
