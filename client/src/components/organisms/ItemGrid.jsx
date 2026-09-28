import ItemCard from '../molecules/ItemCard.jsx'

export default function ItemGrid({ items, showCollection = false, onToggleFavorite, label = 'Items' }) {
  return (
    <ul className="item-grid card-list" aria-label={label}>
      {items.map((item) => (
        <li key={item.id}>
          <ItemCard item={item} showCollection={showCollection} onToggleFavorite={onToggleFavorite} />
        </li>
      ))}
    </ul>
  )
}
