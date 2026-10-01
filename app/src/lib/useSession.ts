import { useEffect, useState } from 'react'
import { cacheSnapshot, cachedSnapshot } from './identity'
import { store, type ConnectionState } from './store'
import type { Snapshot } from './types'

export interface LiveSession extends Snapshot {
  loading: boolean
  connection: ConnectionState
}

/** Live view of one class session. Falls back to the last cached copy while offline. */
export function useSession(code: string | undefined): LiveSession {
  const [state, setState] = useState<LiveSession>(() => {
    const cached = code ? cachedSnapshot(code) : null
    const snap: Snapshot = cached ? JSON.parse(cached) : { session: null, participants: [] }
    return { ...snap, loading: !cached, connection: 'live' }
  })

  useEffect(() => {
    if (!code) return
    const setOnline = () => setState((s) => ({ ...s, connection: navigator.onLine ? s.connection : 'reconnecting' }))
    window.addEventListener('offline', setOnline)
    const stop = store.watch(
      code,
      (snap) => {
        cacheSnapshot(code, JSON.stringify(snap))
        setState((s) => ({ ...s, ...snap, loading: false }))
      },
      (connection) => setState((s) => ({ ...s, connection })),
    )
    return () => {
      window.removeEventListener('offline', setOnline)
      stop()
    }
  }, [code])

  return state
}
