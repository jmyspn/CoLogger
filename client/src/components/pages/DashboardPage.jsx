import Sidebar from '../organisms/Sidebar.jsx'
import Navbar from '../organisms/Navbar.jsx'
import SearchBar from '../molecules/SearchBar.jsx'
import Button from '../atoms/Button.jsx'
import ItemGrid from '../organisms/ItemGrid.jsx'

const recentItems = [
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

export default function DashboardPage() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <Navbar>
          <SearchBar
            value=""
            onChange={() => {}}
            placeholder="Search collections or items..."
          />
        </Navbar>

        <main className="page-content">
          <section className="dashboard-header">
            <div>
              <h2>Welcome!</h2>
              <p>Here is a quick view of your collections.</p>
            </div>

            <Button>+ New Collection</Button>
          </section>

          <section className="summary-grid">
            <div className="card">
              <h3>Total Collections</h3>
              <p>3</p>
            </div>

            <div className="card">
              <h3>Total Items</h3>
              <p>10</p>
            </div>

            <div className="card">
              <h3>Favorites</h3>
              <p>1</p>
            </div>
          </section>

          <section>
            <h2>Recent Items</h2>

            <ItemGrid
              items={recentItems}
              onOpenItem={() => {}}
              onToggleFavorite={() => {}}
            />
          </section>
        </main>
      </div>
    </div>
  )
}