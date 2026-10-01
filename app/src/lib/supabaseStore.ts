import { createClient } from '@supabase/supabase-js'
import type { Participant, Session } from './types'
import { CodeTakenError } from './errors'
import type { Store } from './store'

interface SessionRow {
  code: string
  title: string
  group_count: number
  status: Session['status']
  grouped_at: string | null
  created_at: string
}

interface ParticipantRow {
  id: string
  session_code: string
  name: string
  group_index: number | null
  joined_at: string
}

const toSession = (r: SessionRow): Session => ({
  code: r.code,
  title: r.title,
  groupCount: r.group_count,
  status: r.status,
  groupedAt: r.grouped_at,
  createdAt: r.created_at,
})

const toParticipant = (r: ParticipantRow): Participant => ({
  id: r.id,
  code: r.session_code,
  name: r.name,
  group: r.group_index,
  joinedAt: r.joined_at,
})

const POLL_MS = 15000

export function createSupabaseStore(url: string, key: string): Store {
  const db = createClient(url, key)

  const fail = (error: { message: string } | null) => {
    if (error) throw new Error(error.message)
  }

  return {
    kind: 'supabase',

    async createSession(s) {
      const { error } = await db.from('sessions').insert({
        code: s.code,
        title: s.title,
        group_count: s.groupCount,
        status: s.status,
        grouped_at: s.groupedAt,
      })
      if (error?.code === '23505') throw new CodeTakenError(s.code)
      fail(error)
    },

    async getSession(code) {
      const { data, error } = await db.from('sessions').select('*').eq('code', code).maybeSingle()
      fail(error)
      return data ? toSession(data as SessionRow) : null
    },

    async updateSession(code, patch) {
      const row: Partial<SessionRow> = {}
      if (patch.title !== undefined) row.title = patch.title
      if (patch.groupCount !== undefined) row.group_count = patch.groupCount
      if (patch.status !== undefined) row.status = patch.status
      if (patch.groupedAt !== undefined) row.grouped_at = patch.groupedAt
      fail((await db.from('sessions').update(row).eq('code', code)).error)
    },

    async upsertParticipant(p) {
      fail(
        (
          await db.from('participants').upsert({
            id: p.id,
            session_code: p.code,
            name: p.name,
            group_index: p.group,
          })
        ).error,
      )
    },

    async removeParticipant(code, id) {
      fail((await db.from('participants').delete().eq('session_code', code).eq('id', id)).error)
    },

    async setGroups(code, groups) {
      fail((await db.rpc('set_groups', { p_code: code, p_groups: groups })).error)
    },

    watch(code, onSnapshot, onConnection) {
      let closed = false
      const refresh = async () => {
        const [s, p] = await Promise.all([
          db.from('sessions').select('*').eq('code', code).maybeSingle(),
          db.from('participants').select('*').eq('session_code', code).order('joined_at'),
        ])
        if (closed) return
        if (s.error || p.error) {
          onConnection?.('reconnecting')
          return
        }
        onConnection?.('live')
        onSnapshot({
          session: s.data ? toSession(s.data as SessionRow) : null,
          participants: (p.data as ParticipantRow[]).map(toParticipant),
        })
      }

      // Realtime tells us something changed; we refetch so every client converges on the
      // same full picture even after missed events. A slow poll covers dropped sockets.
      const channel = db
        .channel(`session:${code}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions', filter: `code=eq.${code}` }, refresh)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'participants', filter: `session_code=eq.${code}` },
          refresh,
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') refresh()
          else onConnection?.('reconnecting')
        })
      const timer = setInterval(refresh, POLL_MS)
      const onOnline = () => refresh()
      window.addEventListener('online', onOnline)
      refresh()

      return () => {
        closed = true
        clearInterval(timer)
        window.removeEventListener('online', onOnline)
        db.removeChannel(channel)
      }
    },
  }
}
