// Load something from the API and track its loading / error state.
//
//   const { data, error, loading, reload, setData } = useResource(
//     () => api.getItem(id),
//     [id]
//   )
//
// When the dependencies change (for example the :id in the URL), the old
// result is discarded and the new resource is fetched. A response that arrives
// after the page has moved on is ignored, so /items/4 can never display the
// data from a slower, earlier request for /items/3.

import { useCallback, useEffect, useRef, useState } from 'react'

export function useResource(loader, dependencies) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const requestNumber = useRef(0)

  // The loader is recreated on every render; only refetch when the listed
  // dependencies (such as the id from the URL) actually change.
  const load = useCallback(loader, dependencies)

  const run = useCallback(
    async ({ quiet = false } = {}) => {
      const thisRequest = ++requestNumber.current
      if (!quiet) setState({ data: null, error: null, loading: true })
      try {
        const data = await load()
        if (thisRequest === requestNumber.current) setState({ data, error: null, loading: false })
      } catch (error) {
        if (thisRequest === requestNumber.current) {
          setState((previous) => ({ data: quiet ? previous.data : null, error, loading: false }))
        }
      }
    },
    [load]
  )

  useEffect(() => {
    run()
    return () => {
      requestNumber.current += 1 // ignore anything still in flight
    }
  }, [run])

  // Replace the data locally (after a successful save) without refetching.
  const setData = useCallback((update) => {
    setState((previous) => ({
      ...previous,
      data: typeof update === 'function' ? update(previous.data) : update,
    }))
  }, [])

  // Refetch in the background, keeping the current data on screen meanwhile.
  const reload = useCallback(() => run({ quiet: true }), [run])

  return { ...state, reload, setData }
}
