import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as api from '../../api'
import AppLayout from '../templates/AppLayout.jsx'
import SearchBar from '../molecules/SearchBar.jsx'
import StatusMessage from '../molecules/StatusMessage.jsx'
import Button from '../atoms/Button.jsx'
import CollectionGrid from '../organisms/CollectionGrid.jsx'
import CollectionForm from '../organisms/CollectionForm.jsx'
import { useResource } from '../../hooks/useResource.js'

// All of the user's collections, from GET /api/collections. Item counts are
// calculated by the server from the items table.
//
// "+ New Collection" (here, or on the Dashboard via /collections?new=1) opens
// the CollectionForm dialog. After saving, you land on the new collection.

export default function CollectionsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const creating = searchParams.get('new') === '1'
  const [search, setSearch] = useState('')

  const collections = useResource(() => api.listCollections(), [])

  function openCreate() {
    setSearchParams({ new: '1' })
  }

  function closeCreate() {
    setSearchParams({}, { replace: true })
  }

  async function handleCreate(values) {
    const created = await api.createCollection(values)
    navigate(`/collections/${created.id}`, {
      replace: true,
      state: { notice: `Created collection "${created.name}".` },
    })
  }

  const needle = search.trim().toLowerCase()
  const visible = (collections.data ?? []).filter(
    (collection) =>
      !needle ||
      collection.name.toLowerCase().includes(needle) ||
      collection.description.toLowerCase().includes(needle)
  )

  return (
    <AppLayout
      navbarContent={
        <SearchBar
          id="collections-search"
          label="Search collections"
          placeholder="Search collections…"
          value={search}
          onChange={setSearch}
        />
      }
    >
      <section className="page-header">
        <div>
          <h1>My Collections</h1>
          <p className="muted">View and manage your personal collections.</p>
        </div>
        <Button onClick={openCreate}>+ New Collection</Button>
      </section>

      {collections.loading ? (
        <StatusMessage variant="loading" title="Loading collections…" />
      ) : collections.error ? (
        <StatusMessage
          variant="error"
          title="Could not load your collections"
          action={<Button onClick={collections.reload}>Try again</Button>}
        >
          {collections.error.message}
        </StatusMessage>
      ) : collections.data.length === 0 ? (
        <StatusMessage title="No collections yet" action={<Button onClick={openCreate}>+ New Collection</Button>}>
          Create a collection such as &ldquo;Watches&rdquo; or &ldquo;Sneakers&rdquo;, then add items to it.
        </StatusMessage>
      ) : visible.length === 0 ? (
        <StatusMessage title={`No collections match "${search.trim()}"`}>
          Check the spelling or clear the search.
        </StatusMessage>
      ) : (
        <>
          {needle && (
            <p className="muted" role="status">
              Showing {visible.length} of {collections.data.length} collections
            </p>
          )}
          <CollectionGrid collections={visible} label="Your collections" />
        </>
      )}

      {creating && (
        <CollectionForm
          title="New Collection"
          submitLabel="Create Collection"
          onSubmit={handleCreate}
          onClose={closeCreate}
        />
      )}
    </AppLayout>
  )
}
