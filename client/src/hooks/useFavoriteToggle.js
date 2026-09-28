import { useCallback, useState } from 'react'
import * as api from '../api'

// Shared logic for the heart button on item cards.
//
// It flips the heart immediately (so the click feels instant), saves the change
// through the API, and on failure flips it back and reports the error. The
// caller supplies how to update its own on-screen list and, optionally, what
// to refresh afterwards (e.g. the dashboard's favorite count).
//
//   const { toggleFavorite, favoriteError } = useFavoriteToggle(applyChange, afterSave)

export function useFavoriteToggle(applyChange, afterSave) {
  const [favoriteError, setFavoriteError] = useState('')

  const toggleFavorite = useCallback(
    async (item) => {
      const next = !item.isFavorite
      setFavoriteError('')
      applyChange(item.id, next)
      try {
        await api.setItemFavorite(item.id, next)
        afterSave?.()
      } catch (error) {
        applyChange(item.id, !next)
        setFavoriteError(`Could not update "${item.name}": ${error.message}`)
      }
    },
    [applyChange, afterSave]
  )

  return { toggleFavorite, favoriteError }
}

// Helper for the common case of a plain array of items.
export function setFavoriteInList(items, id, isFavorite) {
  return items?.map((item) => (item.id === id ? { ...item, isFavorite } : item)) ?? items
}
