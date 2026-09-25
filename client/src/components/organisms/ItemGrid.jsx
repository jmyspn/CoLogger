import ItemCard from '../molecules/ItemCard.jsx'

export default function ItemGrid({
  items,
  onOpenItem,
  onToggleFavorite,
}) {
  return (
    <div className="item-grid">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          name={item.name}
          image={item.image}
          condition={item.condition}
          value={item.value}
          isFavorite={item.isFavorite}
          onClick={() => onOpenItem(item.id)}
          onToggleFavorite={() => onToggleFavorite(item.id)}
        />
      ))}
    </div>
  )
}