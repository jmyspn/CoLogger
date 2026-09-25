import { useNavigate } from 'react-router-dom'

export default function Sidebar() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('cologgerDemoSession')
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div>
        <h2 className="sidebar-title">CoLogger</h2>

        <nav className="sidebar-nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/collections">Collections</a>
        </nav>
      </div>

      <button
        type="button"
        className="logout-button"
        onClick={handleLogout}
      >
        Logout
      </button>
    </aside>
  )
}