import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as api from '../../api'
import AppLayout from '../templates/AppLayout.jsx'
import SearchBar from '../molecules/SearchBar.jsx'
import StatusMessage from '../molecules/StatusMessage.jsx'
import Button from '../atoms/Button.jsx'
import ItemGrid from '../organisms/ItemGrid.jsx'
import CollectionForm from '../organisms/CollectionForm.jsx'
import { ResourceNotFound } from './NotFoundPage.jsx'
import { useResource } from '../../hooks/useResource.js'
import { useFlashNotice } from '../../hooks/useFlashNotice.js'
import { setFavoriteInList, useFavoriteToggle } from '../../hooks/useFavoriteToggle.js'
import { pluralize } from '../../lib/format.js'

// /collections/:id shows collection :id and ONLY the items whose collectionId
// is :id (the server filters them). If the id does not exist, or belongs to
// another user, the page says "Collection not found" and shows nothing else.

export default function CollectionDetailsPage() {
  // key={id}: moving from /collections/2 to /collections/3 starts with a fresh
  // page (search box, dialogs, messages), never with state left over from 2.
  const { id } = useParams()
  return <CollectionDetails key={id} id={id} />
}

function CollectionDetails({ id }) {
  const navigate = useNavigate()
  const [notice, setNotice] = useFlashNotice()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState('')

  const page = useResource(async () => {
    const [collection, items] = await Promise.all([
      api.getCollection(id),
      api.listCollectionItems(id),
    ])
    return { collection, items }
  }, [id])

  const { setData } = page
  const applyFavorite = useCallback(
    (itemId, isFavorite) =>
      setData((data) => data && { ...data, items: setFavoriteInList(data.items, itemId, isFavorite) }),
    [setData]
  )
  const { toggleFavorite, favoriteError } = useFavoriteToggle(applyFavorite)

  if (page.loading) {
    return (
      <AppLayout>
        <StatusMessage variant="loading" title="Loading collection…" />
      </AppLayout>
    )
  }

  if (page.error) {
    return (
      <AppLayout>
        {api.isNotFound(page.error) ? (
          <ResourceNotFound
            title="Collection not found"
            message="This collection does not exist, or it was deleted."
            backTo="/collections"
            backLabel="Back to Collections"
          />
        ) : (
          <StatusMessage
            variant="error"
            title="Could not load this collection"
            action={<Button onClick={page.reload}>Try again</Button>}
          >
            {page.error.message}
          </StatusMessage>
        )}
      </AppLayout>
    )
  }

  const { collection, items } = page.data
  const needle = search.trim().toLowerCase()
  const visibleItems = needle ? items.filter((item) => item.name.toLowerCase().includes(needle)) : items

  async function handleRename(values) {
    const updated = await api.updateCollection(collection.id, values)
    setData((data) => ({ ...data, collection: updated }))
    setEditing(false)
    setNotice(`Saved changes to "${updated.name}".`)
  }

  async function handleDelete() {
    const warning =
      items.length > 0
        ? `Delete "${collection.name}" and its ${pluralize(items.length, 'item')}? This cannot be undone.`
        : `Delete "${collection.name}"? This cannot be undone.`
    if (!window.confirm(warning)) return

    setActionError('')
    setDeleting(true)
    try {
      await api.deleteCollection(collection.id)
      navigate('/collections', { replace: true })
    } catch (error) {
      setActionError(`Could not delete the collection: ${error.message}`)
      setDeleting(false)
    }
  }

  return (
    <AppLayout
      navbarContent={
        <SearchBar
          id="collection-item-search"
          label={`Search items in ${collection.name}`}
          placeholder={`Search ${collection.name}…`}
          value={search}
          onChange={setSearch}
        />
      }
    >
      <Link to="/collections" className="back-link">
        <span aria-hidden="true">←</span> Back to Collections
      </Link>

      <section className="page-header">
        <div>
          <h1>{collection.name}</h1>
          <p className="muted">{pluralize(items.length, 'item')}</p>
          {collection.description && <p>{collection.description}</p>}
        </div>

        <div className="page-actions">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Edit Collection
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete Collection'}
          </Button>
          <Button to={`/collections/${collection.id}/items/new`}>+ Add Item</Button>
        </div>
      </section>

      {notice && <StatusMessage variant="notice">{notice}</StatusMessage>}
      {actionError && <StatusMessage variant="error">{actionError}</StatusMessage>}
      {favoriteError && <StatusMessage variant="error">{favoriteError}</StatusMessage>}

      {items.length === 0 ? (
        <StatusMessage
          title="This collection is empty"
          action={<Button to={`/collections/${collection.id}/items/new`}>+ Add the first item</Button>}
        >
          Items you add to {collection.name} will appear here.
        </StatusMessage>
      ) : visibleItems.length === 0 ? (
        <StatusMessage title={`No items in ${collection.name} match "${search.trim()}"`}>
          Check the spelling or clear the search.
        </StatusMessage>
      ) : (
        <ItemGrid
          items={visibleItems}
          label={`Items in ${collection.name}`}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {editing && (
        <CollectionForm
          title="Edit Collection"
          submitLabel="Save Changes"
          initialValues={collection}
          onSubmit={handleRename}
          onClose={() => setEditing(false)}
        />
      )}
    </AppLayout>
  )
}
