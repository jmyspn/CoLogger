import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import { GuestOnly, HomeRedirect, RequireAuth } from './auth/RouteGuards.jsx'

import LoginPage from './components/pages/LoginPage.jsx'
import RegisterPage from './components/pages/RegisterPage.jsx'
import DashboardPage from './components/pages/DashboardPage.jsx'
import CollectionsPage from './components/pages/CollectionsPage.jsx'
import CollectionDetailsPage from './components/pages/CollectionDetailsPage.jsx'
import AddItemPage from './components/pages/AddItemPage.jsx'
import ItemDetailsPage from './components/pages/ItemDetailsPage.jsx'
import EditItemPage from './components/pages/EditItemPage.jsx'
import NotFoundPage from './components/pages/NotFoundPage.jsx'

// On GitHub Pages the site lives under /<repository-name>/, which Vite exposes
// as BASE_URL. Telling the router lets every <Link to="/collections"> work
// both locally ("/") and on Pages ("/CoLogger/").
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />

          {/* Only for visitors who are not logged in. */}
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Everything else requires a login. */}
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:id" element={<CollectionDetailsPage />} />
            <Route path="/collections/:id/items/new" element={<AddItemPage />} />
            <Route path="/items/:id" element={<ItemDetailsPage />} />
            <Route path="/items/:id/edit" element={<EditItemPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
