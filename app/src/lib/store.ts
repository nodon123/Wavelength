import type { Participant, Session, Snapshot } from './types'
import { localStore } from './localStore'
import { createSupabaseStore } from './supabaseStore'

export { CodeTakenError } from './errors'

export type ConnectionState = 'live' | 'reconnecting'

export interface Store {
  /** 'local' syncs between tabs on one device only; 'supabase' syncs across phones. */
  kind: 'local' | 'supabase'
  createSession(session: Session): Promise<void>
  getSession(code: string): Promise<Session | null>
  updateSession(code: string, patch: Partial<Pick<Session, 'title' | 'groupCount' | 'status' | 'groupedAt'>>): Promise<void>
  upsertParticipant(participant: Participant): Promise<void>
  removeParticipant(code: string, id: string): Promise<void>
  setGroups(code: string, groups: Record<string, number | null>): Promise<void>
  watch(
    code: string,
    onSnapshot: (snapshot: Snapshot) => void,
    onConnection?: (state: ConnectionState) => void,
  ): () => void
}

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const store: Store = url && key ? createSupabaseStore(url, key) : localStore
