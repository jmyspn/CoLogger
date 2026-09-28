// GET /api/dashboard: the numbers and recent items on the Dashboard page.
// Everything is counted from the database at request time, so creating,
// deleting or favoriting anything changes the next response.

import { Router } from 'express'
import * as items from '../repos/items.js'

const RECENT_ITEM_COUNT = 6

export function dashboardRouter(pool) {
  const router = Router()

  router.get('/', async (request, response, next) => {
    try {
      const [totals, recentItems] = await Promise.all([
        items.stats(pool, request.user.id),
        items.recent(pool, request.user.id, RECENT_ITEM_COUNT),
      ])
      response.json({ ...totals, recentItems })
    } catch (error) {
      next(error)
    }
  })

  return router
}
