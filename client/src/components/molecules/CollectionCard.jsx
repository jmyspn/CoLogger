export default function CollectionCard({
  title,
  itemCount,
  image,
  onClick,
}) {
  return (
    <article className="collection-card">
      <div className="collection-card-image">
        {image ? (
          <img src={image} alt={`${title} collection`} />
        ) : (
          <div className="image-placeholder">No image</div>
        )}
      </div>

      <div className="collection-card-content">
        <h3>{title}</h3>
        <p>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>

        <button type="button" onClick={onClick}>
          View Collection
        </button>
      </div>
    </article>
  )
}