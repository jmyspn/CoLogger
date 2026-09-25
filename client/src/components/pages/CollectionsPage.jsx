import Sidebar from '../organisms/Sidebar.jsx'
import Navbar from '../organisms/Navbar.jsx'
import SearchBar from '../molecules/SearchBar.jsx'
import Button from '../atoms/Button.jsx'
import CollectionGrid from '../organisms/CollectionGrid.jsx'

const collections = [
  {
    id: 1,
    name: 'Mechanical Keyboards',
    itemCount: 3,
    image: '',
  },
  {
    id: 2,
    name: 'Sneakers',
    itemCount: 2,
    image: '',
  },
  {
    id: 3,
    name: 'Trading Cards',
    itemCount: 5,
    image: '',
  },
]

export default function CollectionsPage() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <Navbar>
          <SearchBar
            value=""
            onChange={() => {}}
            placeholder="Search collections..."
          />
        </Navbar>

        <main className="page-content">
          <section className="page-header">
            <div>
              <h2>My Collections</h2>
              <p>View and manage your personal collections.</p>
            </div>

            <Button>+ New Collection</Button>
          </section>

          <CollectionGrid
            collections={collections}
            onOpenCollection={() => {}}
          />
        </main>
      </div>
    </div>
  )
}