import FavoriteButton from '../atoms/FavoriteButton.jsx'

export default function ItemCard({
  name,
  image,
  condition,
  value,
  isFavorite = false,
  onToggleFavorite,
  onClick,
}) {
  return (
    <article className="item-card">
      <div
        className="item-card-image"
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        {image ? (
          <img src={image} alt={name} />
        ) : (
          <div className="image-placeholder">No image</div>
        )}
      </div>

      <div className="item-card-content">
        <div className="row-head">
          <h3>{name}</h3>

          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={onToggleFavorite}
          />
        </div>

        <p>Condition: {condition}</p>

        {value && <p>Value: {value}</p>}
      </div>
    </article>
  )
}