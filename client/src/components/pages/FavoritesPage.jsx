import { useCallback } from 'react'
import * as api from '../../api'
import AppLayout from '../templates/AppLayout.jsx'
import StatusMessage from '../molecules/StatusMessage.jsx'
import Button from '../atoms/Button.jsx'
import ItemGrid from '../organisms/ItemGrid.jsx'
import { useResource } from '../../hooks/useResource.js'
import { setFavoriteInList, useFavoriteToggle } from '../../hooks/useFavoriteToggle.js'

// Every favorited item, from GET /api/items/favorites.
// Un-hearting leaves the item on screen with an empty heart until the next
// load, so a mis-click can be undone without hunting for the item again.

export default function FavoritesPage() {
  const favorites = useResource(() => api.listFavorites(), [])
  const { setData } = favorites

  const applyFavorite = useCallback(
    (id, isFavorite) => setData((items) => setFavoriteInList(items, id, isFavorite)),
    [setData]
  )

  const { toggleFavorite, favoriteError } = useFavoriteToggle(applyFavorite)

  return (
    <AppLayout>
      <section className="page-header">
        <div>
          <h1>Favorites</h1>
          <p className="muted">Items you have marked as favorites.</p>
        </div>
      </section>

      {favoriteError && <StatusMessage variant="error">{favoriteError}</StatusMessage>}

      {favorites.loading ? (
        <StatusMessage variant="loading" title="Loading favorites…" />
      ) : favorites.error ? (
        <StatusMessage
          variant="error"
          title="Could not load your favorites"
          action={<Button onClick={favorites.reload}>Try again</Button>}
        >
          {favorites.error.message}
        </StatusMessage>
      ) : favorites.data.length === 0 ? (
        <StatusMessage
          title="No favorites yet"
          action={<Button to="/collections">Go to your collections</Button>}
        >
          Tap the heart on any item to keep it here.
        </StatusMessage>
      ) : (
        <ItemGrid
          items={favorites.data}
          label="Your favorites"
          showCollection
          onToggleFavorite={toggleFavorite}
        />
      )}
    </AppLayout>
  )
}