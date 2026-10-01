import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ConnectionBadge, GroupChip, Wordmark } from '../components/Common'
import { joinUrl } from '../lib/code'
import {
  MAX_GROUPS,
  assignGroups,
  clampGroupCount,
  groupIdentity,
  isUnbalanced,
  rebalance,
  suggestGroupCount,
} from '../lib/groups'
import { store } from '../lib/store'
import { useSession } from '../lib/useSession'
import './host.css'

export default function HostDash() {
  const { code = '' } = useParams()
  const { session, participants, loading, connection } = useSession(code)
  const [busy, setBusy] = useState(false)
  // Before sorting, the count follows the headcount until the facilitator picks one.
  const [lobbyCount, setLobbyCount] = useState<number | null>(null)

  const grouped = session?.status === 'grouped'
  const suggested = suggestGroupCount(participants.length)
  const groupCount = grouped ? (session?.groupCount ?? 1) : (lobbyCount ?? suggested)
  const unbalanced = grouped && isUnbalanced(participants, groupCount)

  const groups = useMemo(() => {
    const out = Array.from({ length: groupCount }, () => [] as typeof participants)
    for (const p of participants) if (p.group !== null && p.group < groupCount) out[p.group].push(p)
    return out
  }, [participants, groupCount])
  const waiting = participants.filter((p) => p.group === null || p.group >= groupCount)

  if (loading) return <main className="host-page muted">Loading…</main>
  if (!session)
    return (
      <main className="host-page">
        <p>No session with code {code}.</p>
        <Link to="/host">Start a new one</Link>
      </main>
    )

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  const sortIntoGroups = (count: number) =>
    run(async () => {
      const g = clampGroupCount(count)
      await store.setGroups(code, assignGroups(participants.map((p) => p.id), g))
      await store.updateSession(code, {
        groupCount: g,
        status: 'grouped',
        groupedAt: session.groupedAt ?? new Date().toISOString(),
      })
    })

  const changeCount = (delta: number) => {
    const g = clampGroupCount(groupCount + delta)
    if (g === groupCount) return
    if (!grouped) return setLobbyCount(g)
    return run(async () => {
      await store.setGroups(code, rebalance(participants, g))
      await store.updateSession(code, { groupCount: g })
    })
  }

  const doRebalance = () => run(() => store.setGroups(code, rebalance(participants, groupCount)))

  return (
    <main className="host-page">
      <ConnectionBadge state={connection} />
      <header className="host-header">
        <Wordmark />
        <div className="host-title">
          {session.title && <span className="muted">{session.title}</span>}
          <span className="mono host-code">{code}</span>
        </div>
        <a className="btn small" href={`/present/${code}`} target="_blank" rel="noreferrer">
          Show join screen
        </a>
      </header>

      <section className="host-stats">
        <div className="card stat">
          <span className="eyebrow">Joined</span>
          <strong>{participants.length}</strong>
        </div>
        <div className="card stat">
          <span className="eyebrow">Groups</span>
          <div className="stepper">
            <button className="btn ghost small" onClick={() => changeCount(-1)} disabled={busy || groupCount <= 1}>
              −
            </button>
            <strong>{groupCount}</strong>
            <button
              className="btn ghost small"
              onClick={() => changeCount(1)}
              disabled={busy || groupCount >= MAX_GROUPS}
            >
              +
            </button>
          </div>
          <span className="hint">
            {participants.length > 0 && `About ${Math.ceil(participants.length / groupCount)} per group`}
          </span>
        </div>
        <div className="card stat actions">
          {!grouped ? (
            <>
              <button
                className="btn"
                disabled={busy || participants.length === 0}
                onClick={() => sortIntoGroups(groupCount)}
              >
                Sort into {groupCount} {groupCount === 1 ? 'group' : 'groups'}
              </button>
              <span className="hint">Phones show each student their color the moment you sort.</span>
            </>
          ) : (
            <>
              <button className="btn ghost" disabled={busy} onClick={() => sortIntoGroups(groupCount)}>
                Reshuffle everyone
              </button>
              <span className="hint">Late joiners go into the smallest group automatically.</span>
            </>
          )}
        </div>
      </section>

      {unbalanced && (
        <div className="banner">
          <span>Group sizes have drifted apart.</span>
          <button className="btn small" disabled={busy} onClick={doRebalance}>
            Rebalance
          </button>
        </div>
      )}

      {grouped && (
        <section className="group-grid">
          {groups.map((members, i) => {
            const g = groupIdentity(i)
            return (
              <div key={i} className="card group-card" style={{ borderColor: g.color.base }}>
                <div className="group-card-head">
                  <GroupChip index={i} />
                  <span className="muted">{members.length}</span>
                </div>
                <ul className="names">
                  {members.map((p) => (
                    <NameRow key={p.id} name={p.name} onRemove={() => store.removeParticipant(code, p.id)} />
                  ))}
                </ul>
              </div>
            )
          })}
        </section>
      )}

      {(!grouped || waiting.length > 0) && (
        <section className="card">
          <div className="group-card-head">
            <span className="eyebrow">{grouped ? 'Not in a group yet' : 'In the lobby'}</span>
            <span className="muted">{waiting.length}</span>
          </div>
          {waiting.length === 0 ? (
            <p className="muted">
              Nobody yet. Students join at <span className="mono">{joinUrl(code).replace(/^https?:\/\//, '')}</span>
            </p>
          ) : (
            <ul className="names wrap">
              {waiting.map((p) => (
                <NameRow key={p.id} name={p.name} onRemove={() => store.removeParticipant(code, p.id)} />
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  )
}

function NameRow({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <li>
      <span>{name}</span>
      <button className="remove" aria-label={`Remove ${name}`} title="Remove" onClick={onRemove}>
        ×
      </button>
    </li>
  )
}
