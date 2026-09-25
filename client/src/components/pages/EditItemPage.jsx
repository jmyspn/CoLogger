import { useState } from 'react'
import Sidebar from '../organisms/Sidebar.jsx'
import Navbar from '../organisms/Navbar.jsx'
import ItemForm from '../organisms/ItemForm.jsx'

const EXISTING_ITEM = {
  name: 'MCHOSE Ace 68',
  image: '',
  value: '4500',
  currency: 'PHP',
  purchasePrice: '4000',
  acquiredDate: '2026-09-01',
  acquiredFrom: 'Local Store',
  condition: 'Like New',
  notes: 'One of my favorite Hall Effect keyboards.',
  isFavorite: true,
}

export default function EditItemPage() {
  const [item, setItem] = useState(EXISTING_ITEM)

  function handleSubmit(event) {
    event.preventDefault()

    console.log('Updated item:', item)
  }

  function handleCancel() {
    setItem(EXISTING_ITEM)
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <Navbar />

        <main className="page-content">
          <header className="page-header">
            <div>
              <p>← Back to Item</p>
              <h2>Edit Item</h2>
              <p>Update the information for this item.</p>
            </div>
          </header>

          <ItemForm
            item={item}
            setItem={setItem}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Update Item"
          />
        </main>
      </div>
    </div>
  )
}