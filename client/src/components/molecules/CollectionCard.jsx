import { Link } from 'react-router-dom'
import { pluralize } from '../../lib/format.js'

// One collection in the grid. The heading is the link, so keyboard and
// screen-reader users get one clear "open Watches" target per card; the
// "View Collection" link is a second, visible way to open it.

export default function CollectionCard({ collection }) {
  const { id, name, description, itemCount, coverImage } = collection
  const href = `/collections/${id}`

  return (
    <article className="collection-card">
      <div className="collection-card-image">
        {coverImage ? (
          <img src={coverImage} alt="" />
        ) : (
          <div className="image-placeholder" aria-hidden="true">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="collection-card-content">
        <h3>
          <Link to={href}>{name}</Link>
        </h3>
        <p className="muted">{pluralize(itemCount, 'item')}</p>
        {description && <p className="card-description">{description}</p>}

        <Link to={href} className="button button-secondary card-action">
          View Collection<span className="visually-hidden">: {name}</span>
        </Link>
      </div>
    </article>
  )
}
