// Heart toggle. aria-pressed tells assistive technology whether it is on, and
// the label names the item so a screen-reader user hears which item it affects.

export default function FavoriteButton({ isFavorite, onToggle, itemName = '', disabled = false }) {
  const label = isFavorite
    ? `Remove ${itemName || 'item'} from favorites`
    : `Add ${itemName || 'item'} to favorites`

  return (
    <button
      type="button"
      className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
      onClick={onToggle}
      aria-pressed={isFavorite}
      aria-label={label}
      title={isFavorite ? 'Favorite' : 'Not a favorite'}
      disabled={disabled}
    >
      <span aria-hidden="true">{isFavorite ? '♥' : '♡'}</span>
    </button>
  )
}
