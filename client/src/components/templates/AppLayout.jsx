import Sidebar from '../organisms/Sidebar.jsx'
import Navbar from '../organisms/Navbar.jsx'
import DemoNotice from '../DemoNotice.jsx'

// The frame shared by every logged-in page: sidebar, top bar, demo notice and
// the <main> landmark. Pages supply only their own content, so the frame is
// written once instead of eight times.
//
// navbarContent: optional tool for the top bar, usually a <SearchBar>.

export default function AppLayout({ navbarContent, children }) {
  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Sidebar />

      <div className="main-area">
        <Navbar>{navbarContent}</Navbar>

        <main id="main-content" className="page-content" tabIndex={-1}>
          <DemoNotice />
          {children}
        </main>
      </div>
    </div>
  )
}
