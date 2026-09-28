import { Link } from 'react-router-dom'
import FavoriteButton from '../atoms/FavoriteButton.jsx'
import { formatMoney } from '../../lib/format.js'

// One item in a grid. Opening the item is a real link (the item name); the
// image is also clickable for mouse and touch users but is skipped by the Tab
// key so keyboard users do not meet the same link twice.

export default function ItemCard({ item, showCollection = false, onToggleFavorite }) {
  const href = `/items/${item.id}`

  return (
    <article className="item-card">
      <Link to={href} className="item-card-image" tabIndex={-1} aria-hidden="true">
        {item.image ? (
          <img src={item.image} alt="" />
        ) : (
          <div className="image-placeholder">No image</div>
        )}
      </Link>

      <div className="item-card-content">
        <div className="row-head">
          <h3>
            <Link to={href}>{item.name}</Link>
          </h3>

          {onToggleFavorite && (
            <FavoriteButton
              isFavorite={item.isFavorite}
              itemName={item.name}
              onToggle={() => onToggleFavorite(item)}
            />
          )}
        </div>

        {showCollection && item.collectionName && (
          <p className="item-card-collection">{item.collectionName}</p>
        )}
        <p>
          <span className="muted">Condition:</span> {item.condition || 'Not set'}
        </p>
        <p>
          <span className="muted">Value:</span> {formatMoney(item.estimatedValue, item.currency)}
        </p>
      </div>
    </article>
  )
}
