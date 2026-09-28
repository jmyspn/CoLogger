import CollectionCard from '../molecules/CollectionCard.jsx'

export default function CollectionGrid({ collections, label = 'Collections' }) {
  return (
    <ul className="collection-grid card-list" aria-label={label}>
      {collections.map((collection) => (
        <li key={collection.id}>
          <CollectionCard collection={collection} />
        </li>
      ))}
    </ul>
  )
}
