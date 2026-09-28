import { Link, useNavigate, useParams } from 'react-router-dom'
import * as api from '../../api'
import AppLayout from '../templates/AppLayout.jsx'
import StatusMessage from '../molecules/StatusMessage.jsx'
import Button from '../atoms/Button.jsx'
import ItemForm from '../organisms/ItemForm.jsx'
import { ResourceNotFound } from './NotFoundPage.jsx'
import { useResource } from '../../hooks/useResource.js'

// /collections/:id/items/new
//
// The collection comes from the URL. The page loads it first (to show its name
// and to refuse a collection id that does not exist), then saves the new item
// with POST /api/collections/:id/items, so the item can only ever be created
// inside the collection named in the URL.

export default function AddItemPage() {
  const { id } = useParams()
  return <AddItem key={id} collectionId={id} />
}

function AddItem({ collectionId }) {
  const navigate = useNavigate()
  const collection = useResource(() => api.getCollection(collectionId), [collectionId])

  if (collection.loading) {
    return (
      <AppLayout>
        <StatusMessage variant="loading" title="Loading…" />
      </AppLayout>
    )
  }

  if (collection.error) {
    return (
      <AppLayout>
        {api.isNotFound(collection.error) ? (
          <ResourceNotFound
            title="Collection not found"
            message="You cannot add an item to a collection that does not exist."
            backTo="/collections"
            backLabel="Back to Collections"
          />
        ) : (
          <StatusMessage
            variant="error"
            title="Could not load the collection"
            action={<Button onClick={collection.reload}>Try again</Button>}
          >
            {collection.error.message}
          </StatusMessage>
        )}
      </AppLayout>
    )
  }

  const { id, name } = collection.data
  const collectionPath = `/collections/${id}`

  async function handleSubmit(payload) {
    const created = await api.createItem(id, payload)
    navigate(collectionPath, { state: { notice: `Added "${created.name}" to ${name}.` } })
  }

  return (
    <AppLayout>
      <Link to={collectionPath} className="back-link">
        <span aria-hidden="true">←</span> Back to {name}
      </Link>

      <header className="page-header">
        <div>
          <h1>Add New Item</h1>
          <p className="muted">
            Adding to <strong>{name}</strong>.
          </p>
        </div>
      </header>

      <ItemForm onSubmit={handleSubmit} onCancel={() => navigate(collectionPath)} submitLabel="Save Item" />
    </AppLayout>
  )
}
