import Sidebar from '../organisms/Sidebar.jsx'
import Navbar from '../organisms/Navbar.jsx'
import Button from '../atoms/Button.jsx'
import ItemGrid from '../organisms/ItemGrid.jsx'

const items = [
  {
    id: 1,
    name: 'MCHOSE Ace 68',
    image: '',
    condition: 'Like New',
    value: '₱4,500',
    isFavorite: true,
  },
  {
    id: 2,
    name: 'Wooting 60HE',
    image: '',
    condition: 'Good',
    value: '₱10,000',
    isFavorite: false,
  },
  {
    id: 3,
    name: 'Keychron Q1',
    image: '',
    condition: 'Good',
    value: '₱7,500',
    isFavorite: false,
  },
]

export default function CollectionDetailsPage() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <Navbar />

        <main className="page-content">
          <Button variant="secondary">
            ← Back to Collections
          </Button>

          <section className="page-header">
            <div>
              <h2>Mechanical Keyboards</h2>
              <p>3 items</p>
              <p>
                My mechanical and Hall Effect keyboard collection.
              </p>
            </div>

            <div className="page-actions">
              <Button variant="secondary">
                Edit Collection
              </Button>

              <Button>
                + Add Item
              </Button>
            </div>
          </section>

          <ItemGrid
            items={items}
            onOpenItem={() => {}}
            onToggleFavorite={() => {}}
          />
        </main>
      </div>
    </div>
  )
}