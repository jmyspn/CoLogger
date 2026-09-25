import CollectionCard from '../molecules/CollectionCard.jsx'

export default function CollectionGrid({
  collections,
  onOpenCollection,
}) {
  return (
    <div className="collection-grid">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          title={collection.name}
          itemCount={collection.itemCount}
          image={collection.image}
          onClick={() => onOpenCollection(collection.id)}
        />
      ))}
    </div>
  )
}