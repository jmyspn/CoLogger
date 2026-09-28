// Route guards used in App.jsx.
//
//   <RequireAuth>  the app's pages. Not logged in → /login, and after logging
//                  in the user is sent back to the page they asked for.
//   <GuestOnly>    /login and /register. Already logged in → /dashboard.

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import StatusMessage from '../components/molecules/StatusMessage.jsx'
import Button from '../components/atoms/Button.jsx'

function SessionStatus() {
  const { status, retry } = useAuth()

  if (status === 'unreachable') {
    return (
      <main className="centered-page">
        <StatusMessage
          variant="error"
          title="Can't reach CoLogger"
          action={<Button onClick={retry}>Try again</Button>}
        >
          The server did not respond. If it has been idle it may take up to a minute to
          wake up.
        </StatusMessage>
      </main>
    )
  }

  return (
    <main className="centered-page">
      <StatusMessage variant="loading" title="Loading CoLogger…" />
    </main>
  )
}

export function RequireAuth() {
  const { user, status } = useAuth()
  const location = useLocation()

  if (status !== 'ready') return <SessionStatus />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export function GuestOnly() {
  const { user, status } = useAuth()

  if (status !== 'ready') return <SessionStatus />
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export function HomeRedirect() {
  const { user, status } = useAuth()
  if (status !== 'ready') return <SessionStatus />
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}
