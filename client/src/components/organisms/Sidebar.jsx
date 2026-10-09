import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'

// Main navigation. NavLink marks the current section with aria-current="page"
// (and the .active class for styling). On screens narrower than 768px the CSS
// turns this vertical sidebar into a compact bar across the top of the page.

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <Link to="/dashboard" className="sidebar-brand">
        CoLogger
      </Link>

      <nav className="sidebar-nav" aria-label="Main">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/collections">Collections</NavLink>
        <NavLink to="/favorites">Favorites</NavLink>
      </nav>

      <button type="button" className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  )
}
