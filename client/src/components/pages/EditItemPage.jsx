import { Link, useNavigate, useParams } from 'react-router-dom'
import * as api from '../../api'
import AppLayout from '../templates/AppLayout.jsx'
import StatusMessage from '../molecules/StatusMessage.jsx'
import Button from '../atoms/Button.jsx'
import ItemForm from '../organisms/ItemForm.jsx'
import { ResourceNotFound } from './NotFoundPage.jsx'
import { useResource } from '../../hooks/useResource.js'

// /items/:id/edit loads item :id from the API and fills the shared ItemForm
// with ITS values. The form is only rendered after the item has loaded, so it
// can never show another item's data (or an empty form) first.

export default function EditItemPage() {
  const { id } = useParams()
  return <EditItem key={id} id={id} />
}

function EditItem({ id }) {
  const navigate = useNavigate()
  const item = useResource(() => api.getItem(id), [id])

  if (item.loading) {
    return (
      <AppLayout>
        <StatusMessage variant="loading" title="Loading item…" />
      </AppLayout>
    )
  }

  if (item.error) {
    return (
      <AppLayout>
        {api.isNotFound(item.error) ? (
          <ResourceNotFound
            title="Item not found"
            message="This item does not exist, so it cannot be edited."
            backTo="/collections"
            backLabel="Back to Collections"
          />
        ) : (
          <StatusMessage
            variant="error"
            title="Could not load this item"
            action={<Button onClick={item.reload}>Try again</Button>}
          >
            {item.error.message}
          </StatusMessage>
        )}
      </AppLayout>
    )
  }

  const data = item.data
  const itemPath = `/items/${data.id}`

  async function handleSubmit(payload) {
    const saved = await api.updateItem(data.id, payload)
    navigate(itemPath, { replace: true, state: { notice: `Saved changes to "${saved.name}".` } })
  }

  return (
    <AppLayout>
      <Link to={itemPath} className="back-link">
        <span aria-hidden="true">←</span> Back to {data.name}
      </Link>

      <header className="page-header">
        <div>
          <h1>Edit Item</h1>
          <p className="muted">
            Editing <strong>{data.name}</strong> in {data.collectionName}.
          </p>
        </div>
      </header>

      <ItemForm
        initialValues={data}
        onSubmit={handleSubmit}
        onCancel={() => navigate(itemPath)}
        submitLabel="Update Item"
      />
    </AppLayout>
  )
}
