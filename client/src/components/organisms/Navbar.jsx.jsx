export default function Navbar({
  title = 'CoLogger',
  children,
}) {
  return (
    <header className="navbar">
      <div className="navbar-title">
        <h1>{title}</h1>
      </div>

      <div className="navbar-actions">
        {children}
      </div>
    </header>
  )
}