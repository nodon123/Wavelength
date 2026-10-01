import type { Participant, Session, Snapshot } from './types'
import { CodeTakenError } from './errors'
import type { Store } from './store'

// Stand-in backend for when no Supabase project is configured. Data lives in this
// browser's localStorage and changes reach other tabs through a BroadcastChannel, so a
// laptop can demo the projector view and several "phones" side by side.

interface Db {
  sessions: Record<string, Session>
  participants: Record<string, Participant[]>
}

const DB_KEY = 'wl:localdb'
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('wl:localdb') : null
const listeners = new Set<() => void>()

function load(): Db {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw) as Db
  } catch {
    // fall through to an empty db
  }
  return { sessions: {}, participants: {} }
}

function save(db: Db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
  listeners.forEach((fn) => fn())
  channel?.postMessage('changed')
}

channel?.addEventListener('message', () => listeners.forEach((fn) => fn()))

function snapshot(code: string): Snapshot {
  const db = load()
  return { session: db.sessions[code] ?? null, participants: db.participants[code] ?? [] }
}

export const localStore: Store = {
  kind: 'local',

  async createSession(session) {
    const db = load()
    if (db.sessions[session.code]) {
      throw new CodeTakenError(session.code)
    }
    db.sessions[session.code] = session
    db.participants[session.code] = []
    save(db)
  },

  async getSession(code) {
    return load().sessions[code] ?? null
  },

  async updateSession(code, patch) {
    const db = load()
    const current = db.sessions[code]
    if (!current) return
    db.sessions[code] = { ...current, ...patch }
    save(db)
  },

  async upsertParticipant(participant) {
    const db = load()
    const list = db.participants[participant.code] ?? []
    const i = list.findIndex((p) => p.id === participant.id)
    if (i >= 0) list[i] = participant
    else list.push(participant)
    db.participants[participant.code] = list
    save(db)
  },

  async removeParticipant(code, id) {
    const db = load()
    db.participants[code] = (db.participants[code] ?? []).filter((p) => p.id !== id)
    save(db)
  },

  async setGroups(code, groups) {
    const db = load()
    db.participants[code] = (db.participants[code] ?? []).map((p) =>
      p.id in groups ? { ...p, group: groups[p.id] } : p,
    )
    save(db)
  },

  watch(code, onSnapshot, onConnection) {
    const emit = () => onSnapshot(snapshot(code))
    listeners.add(emit)
    emit()
    onConnection?.('live')
    return () => {
      listeners.delete(emit)
    }
  },
}
