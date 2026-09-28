import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as api from '../../api'
import AppLayout from '../templates/AppLayout.jsx'
import StatusMessage from '../molecules/StatusMessage.jsx'
import Button from '../atoms/Button.jsx'
import FavoriteButton from '../atoms/FavoriteButton.jsx'
import { ResourceNotFound } from './NotFoundPage.jsx'
import { useResource } from '../../hooks/useResource.js'
import { useFlashNotice } from '../../hooks/useFlashNotice.js'
import { formatDate, formatMoney } from '../../lib/format.js'

// /items/:id shows exactly item :id, loaded with GET /api/items/:id.
// "Back" goes to the collection the item actually belongs to (item.collectionId).

export default function ItemDetailsPage() {
  const { id } = useParams()
  return <ItemDetails key={id} id={id} />
}

function ItemDetails({ id }) {
  const navigate = useNavigate()
  const [notice] = useFlashNotice()
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
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
            message="This item does not exist, or it was deleted."
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
  const collectionPath = `/collections/${data.collectionId}`

  async function toggleFavorite() {
    // Ignore extra clicks while saving. (The button is not disabled, because
    // disabling a focused button throws keyboard focus back to the page.)
    if (busy) return
    setActionError('')
    setBusy(true)
    try {
      item.setData(await api.setItemFavorite(data.id, !data.isFavorite))
    } catch (error) {
      setActionError(`Could not update favorite: ${error.message}`)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${data.name}"? This cannot be undone.`)) return
    setActionError('')
    setBusy(true)
    try {
      await api.deleteItem(data.id)
      navigate(collectionPath, {
        replace: true,
        state: { notice: `Deleted "${data.name}".` },
      })
    } catch (error) {
      setActionError(`Could not delete the item: ${error.message}`)
      setBusy(false)
    }
  }

  const details = [
    ['Condition', data.condition || 'Not set'],
    ['Estimated Value', formatMoney(data.estimatedValue, data.currency)],
    ['Purchase Price', formatMoney(data.purchasePrice, data.currency)],
    ['Acquired Date', formatDate(data.acquiredDate)],
    ['Acquired From', data.acquiredFrom || '—'],
  ]

  return (
    <AppLayout>
      <Link to={collectionPath} className="back-link">
        <span aria-hidden="true">←</span> Back to {data.collectionName}
      </Link>

      {notice && <StatusMessage variant="notice">{notice}</StatusMessage>}
      {actionError && <StatusMessage variant="error">{actionError}</StatusMessage>}

      <article className="item-details card">
        <div className="item-details-image">
          {data.image ? (
            <img src={data.image} alt={data.name} />
          ) : (
            <div className="image-placeholder">No image</div>
          )}
        </div>

        <div className="item-details-info">
          <div className="row-head">
            <div>
              <h1>{data.name}</h1>
              <p className="muted">
                In <Link to={collectionPath}>{data.collectionName}</Link>
              </p>
            </div>

            <FavoriteButton
              isFavorite={data.isFavorite}
              itemName={data.name}
              onToggle={toggleFavorite}
            />
          </div>

          <dl className="detail-list">
            {details.map(([label, value]) => (
              <div key={label} className="detail-row">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            <div className="detail-row detail-notes">
              <dt>Notes</dt>
              <dd>{data.notes || '—'}</dd>
            </div>
          </dl>

          <div className="page-actions">
            <Button to={`/items/${data.id}/edit`}>Edit Item</Button>
            <Button variant="danger" onClick={handleDelete} disabled={busy}>
              Delete Item
            </Button>
          </div>
        </div>
      </article>
    </AppLayout>
  )
}
