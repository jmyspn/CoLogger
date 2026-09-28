import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// A one-time confirmation passed between pages, e.g. after deleting an item:
//
//   navigate('/collections/2', { state: { notice: 'Deleted "Casio G-Shock".' } })
//
// The receiving page shows it once. The message is then removed from browser
// history, so refreshing the page does not show "Deleted…" again.

export function useFlashNotice() {
  const location = useLocation()
  const navigate = useNavigate()
  const [notice, setNotice] = useState(location.state?.notice || '')

  useEffect(() => {
    if (location.state?.notice) {
      setNotice(location.state.notice)
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
    }
  }, [location, navigate])

  return [notice, setNotice]
}
