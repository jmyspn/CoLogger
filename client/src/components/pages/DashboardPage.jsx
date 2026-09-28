import { useCallback, useState } from 'react'
import * as api from '../../api'
import AppLayout from '../templates/AppLayout.jsx'
import SearchBar from '../molecules/SearchBar.jsx'
import StatusMessage from '../molecules/StatusMessage.jsx'
import Button from '../atoms/Button.jsx'
import ItemGrid from '../organisms/ItemGrid.jsx'
import CollectionGrid from '../organisms/CollectionGrid.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useResource } from '../../hooks/useResource.js'
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js'
import { setFavoriteInList, useFavoriteToggle } from '../../hooks/useFavoriteToggle.js'

// Everything on this page comes from GET /api/dashboard (totals counted by the
// database, newest items) and, while searching, from the item search endpoint.
// Nothing is hardcoded, so creating, deleting or favoriting anything elsewhere
// changes these numbers the next time the page loads.

export default function DashboardPage() {
  const { user } = useAuth()
  const dashboard = useResource(() => api.getDashboard(), [])

  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search.trim(), 250)
  const results = useResource(async () => {
    if (!query) return null
    const [items, collections] = await Promise.all([api.searchItems(query), api.listCollections()])
    const needle = query.toLowerCase()
    return {
      items,
      collections: collections.filter((collection) => collection.name.toLowerCase().includes(needle)),
    }
  }, [query])

  const { setData: setDashboard, reload: reloadDashboard } = dashboard
  const { setData: setResults } = results

  const applyFavorite = useCallback(
    (id, isFavorite) => {
      setDashboard((data) => data && { ...data, recentItems: setFavoriteInList(data.recentItems, id, isFavorite) })
      setResults((data) => data && { ...data, items: setFavoriteInList(data.items, id, isFavorite) })
    },
    [setDashboard, setResults]
  )
  // Re-count favorites from the server after every change.
  const { toggleFavorite, favoriteError } = useFavoriteToggle(applyFavorite, reloadDashboard)

  const firstName = user?.name?.split(' ')[0] || 'collector'
  const stats = dashboard.data

  return (
    <AppLayout
      navbarContent={
        <SearchBar
          id="dashboard-search"
          label="Search your collections and items"
          placeholder="Search collections or items…"
          value={search}
          onChange={setSearch}
        />
      }
    >
      <section className="page-header">
        <div>
          <h1>Welcome, {firstName}!</h1>
          <p className="muted">Here is a quick view of your collections.</p>
        </div>
        <Button to="/collections?new=1">+ New Collection</Button>
      </section>

      {favoriteError && <StatusMessage variant="error">{favoriteError}</StatusMessage>}

      {query ? (
        <SearchResults query={query} results={results} onToggleFavorite={toggleFavorite} />
      ) : dashboard.loading ? (
        <StatusMessage variant="loading" title="Loading your dashboard…" />
      ) : dashboard.error ? (
        <StatusMessage
          variant="error"
          title="Could not load your dashboard"
          action={<Button onClick={reloadDashboard}>Try again</Button>}
        >
          {dashboard.error.message}
        </StatusMessage>
      ) : (
        <>
          <section className="summary-grid" aria-label="Totals">
            <SummaryCard label="Total Collections" value={stats.totalCollections} to="/collections" />
            <SummaryCard label="Total Items" value={stats.totalItems} />
            <SummaryCard label="Favorites" value={stats.totalFavorites} />
          </section>

          <section className="page-section" aria-labelledby="recent-items-title">
            <h2 id="recent-items-title">Recent Items</h2>
            {stats.recentItems.length === 0 ? (
              <StatusMessage
                title="No items yet"
                action={<Button to="/collections">Go to your collections</Button>}
              >
                {stats.totalCollections === 0
                  ? 'Create your first collection, then add items to it.'
                  : 'Open a collection and add your first item.'}
              </StatusMessage>
            ) : (
              <ItemGrid
                items={stats.recentItems}
                label="Recent items"
                showCollection
                onToggleFavorite={toggleFavorite}
              />
            )}
          </section>
        </>
      )}
    </AppLayout>
  )
}

function SummaryCard({ label, value, to }) {
  return (
    <div className="card summary-card">
      <h2 className="summary-label">{label}</h2>
      <p className="summary-value">{value}</p>
      {to && (
        <Button to={to} variant="ghost" className="summary-link">
          View all<span className="visually-hidden"> {label.toLowerCase()}</span>
        </Button>
      )}
    </div>
  )
}

function SearchResults({ query, results, onToggleFavorite }) {
  // !results.data covers the moment between typing and the new request starting.
  if (results.loading || (!results.error && !results.data)) {
    return <StatusMessage variant="loading" title={`Searching for "${query}"…`} />
  }
  if (results.error) {
    return (
      <StatusMessage variant="error" title="Search failed">
        {results.error.message}
      </StatusMessage>
    )
  }

  const { items, collections } = results.data
  if (items.length === 0 && collections.length === 0) {
    return <StatusMessage title={`Nothing matches "${query}"`}>Try a different word.</StatusMessage>
  }

  return (
    <div aria-live="polite">
      {collections.length > 0 && (
        <section className="page-section" aria-labelledby="collection-results-title">
          <h2 id="collection-results-title">Collections matching &ldquo;{query}&rdquo;</h2>
          <CollectionGrid collections={collections} label="Matching collections" />
        </section>
      )}
      {items.length > 0 && (
        <section className="page-section" aria-labelledby="item-results-title">
          <h2 id="item-results-title">Items matching &ldquo;{query}&rdquo;</h2>
          <ItemGrid items={items} label="Matching items" showCollection onToggleFavorite={onToggleFavorite} />
        </section>
      )}
    </div>
  )
}
