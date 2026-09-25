export default function FavoriteButton({
  isFavorite,
  onToggle,
}) {
  return (
    <button
      type="button"
      className="favorite-button"
      onClick={onToggle}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? '♥' : '♡'}
    </button>
  )
}