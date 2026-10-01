export type SessionStatus = 'lobby' | 'grouped'

export interface Session {
  code: string
  title: string
  groupCount: number
  status: SessionStatus
  /** When groups first went out; anyone who joins after this is a late joiner. */
  groupedAt: string | null
  createdAt: string
}

export interface Participant {
  id: string
  code: string
  name: string
  /** Index into the group palette, or null while waiting in the lobby. */
  group: number | null
  joinedAt: string
}

export interface Snapshot {
  session: Session | null
  participants: Participant[]
}
