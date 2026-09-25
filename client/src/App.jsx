import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import LoginPage from './components/pages/LoginPage.jsx'
import RegisterPage from './components/pages/RegisterPage.jsx'
import DashboardPage from './components/pages/DashboardPage.jsx'
import CollectionsPage from './components/pages/CollectionsPage.jsx'
import CollectionDetailsPage from './components/pages/CollectionDetailsPage.jsx'
import AddItemPage from './components/pages/AddItemPage.jsx'
import ItemDetailsPage from './components/pages/ItemDetailsPage.jsx'
import EditItemPage from './components/pages/EditItemPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/collections"
          element={<CollectionsPage />}
        />

        <Route
          path="/collections/:id"
          element={<CollectionDetailsPage />}
        />

        <Route
          path="/collections/:id/items/new"
          element={<AddItemPage />}
        />

        <Route
          path="/items/:id"
          element={<ItemDetailsPage />}
        />

        <Route
          path="/items/:id/edit"
          element={<EditItemPage />}
        />
      </Routes>
    </BrowserRouter>
  )
}