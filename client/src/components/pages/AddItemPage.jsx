import { useState } from 'react'
import Sidebar from '../organisms/Sidebar.jsx'
import Navbar from '../organisms/Navbar.jsx'
import ItemForm from '../organisms/ItemForm.jsx'

const EMPTY_ITEM = {
  name: '',
  image: '',
  value: '',
  currency: 'PHP',
  purchasePrice: '',
  acquiredDate: '',
  acquiredFrom: '',
  condition: '',
  notes: '',
  isFavorite: false,
}

export default function AddItemPage() {
  const [item, setItem] = useState(EMPTY_ITEM)

  function handleSubmit(event) {
    event.preventDefault()

    console.log('New item:', item)
  }

  function handleCancel() {
    setItem(EMPTY_ITEM)
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <Navbar />

        <main className="page-content">
          <header className="page-header">
            <div>
              <p>← Back to Collection</p>
              <h2>Add New Item</h2>
              <p>Add an item to your collection.</p>
            </div>
          </header>

          <ItemForm
            item={item}
            setItem={setItem}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Save Item"
          />
        </main>
      </div>
    </div>
  )
}