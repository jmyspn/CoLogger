import AppLayout from '../templates/AppLayout.jsx'
import StatusMessage from '../molecules/StatusMessage.jsx'
import Button from '../atoms/Button.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'

// Shown for a URL that matches no route, and (through ResourceNotFound) for a
// collection or item id that does not exist. It never falls back to some other
// record: a wrong id should look wrong.

export function ResourceNotFound({ title, message, backTo, backLabel }) {
  return (
    <div className="not-found">
      <h1>{title}</h1>
      <StatusMessage variant="error" action={<Button to={backTo}>{backLabel}</Button>}>
        {message}
      </StatusMessage>
    </div>
  )
}

export default function NotFoundPage() {
  const { user } = useAuth()
  const content = (
    <ResourceNotFound
      title="Page not found"
      message="There is no page at this address."
      backTo={user ? '/dashboard' : '/login'}
      backLabel={user ? 'Go to the dashboard' : 'Go to login'}
    />
  )

  return user ? <AppLayout>{content}</AppLayout> : <main className="centered-page">{content}</main>
}
