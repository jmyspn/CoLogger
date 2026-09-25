import Sidebar from '../organisms/Sidebar.jsx'
import Navbar from '../organisms/Navbar.jsx'
import Button from '../atoms/Button.jsx'
import FavoriteButton from '../atoms/FavoriteButton.jsx'

export default function ItemDetailsPage() {
  const item = {
    name: 'MCHOSE Ace 68',
    collection: 'Mechanical Keyboards',
    image: '',
    condition: 'Like New',
    value: '₱4,500',
    purchasePrice: '₱4,000',
    acquiredDate: '2026-09-01',
    acquiredFrom: 'Local Store',
    notes: 'One of my favorite Hall Effect keyboards.',
    isFavorite: true,
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <Navbar />

        <main className="page-content">
          <Button variant="secondary">
            ← Back to Collection
          </Button>

          <section className="item-details">
            <div className="item-details-image">
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <div className="image-placeholder">
                  No image
                </div>
              )}
            </div>

            <div className="item-details-info">
              <div className="row-head">
                <div>
                  <h2>{item.name}</h2>
                  <p>{item.collection}</p>
                </div>

                <FavoriteButton
                  isFavorite={item.isFavorite}
                  onToggle={() => {}}
                />
              </div>

              <p>
                <strong>Condition:</strong> {item.condition}
              </p>

              <p>
                <strong>Estimated Value:</strong> {item.value}
              </p>

              <p>
                <strong>Purchase Price:</strong> {item.purchasePrice}
              </p>

              <p>
                <strong>Acquired Date:</strong> {item.acquiredDate}
              </p>

              <p>
                <strong>Acquired From:</strong> {item.acquiredFrom}
              </p>

              <p>
                <strong>Notes:</strong> {item.notes}
              </p>

              <div className="page-actions">
                <Button>
                  Edit Item
                </Button>

                <Button variant="secondary">
                  Delete Item
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}