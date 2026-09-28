import { useAuth } from '../../auth/AuthContext.jsx'

// The bar across the top of the main area: a page-specific tool on the left
// (usually a SearchBar, passed as children) and who is logged in on the right.

export default function Navbar({ children }) {
  const { user } = useAuth()

  return (
    <header className="navbar">
      <div className="navbar-tools">{children}</div>
      {user && (
        <p className="navbar-user">
          <span className="muted">Signed in as</span> <strong>{user.name}</strong>
        </p>
      )}
    </header>
  )
}
