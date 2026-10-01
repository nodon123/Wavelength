import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ConnectionBadge, Wordmark } from '../components/Common'
import { normalizeCode } from '../lib/code'
import { groupIdentity, smallestGroup } from '../lib/groups'
import { myParticipantId, rememberName, rememberedName } from '../lib/identity'
import { store } from '../lib/store'
import type { Participant, Session } from '../lib/types'
import { useSession } from '../lib/useSession'
import './join.css'

export default function Join() {
  const { code: rawCode = '' } = useParams()
  const code = normalizeCode(rawCode)
  const { session, participants, loading, connection } = useSession(code)
  const myId = myParticipantId(code)
  const me = participants.find((p) => p.id === myId)

  if (loading) return <main className="phone-page muted">Finding your class…</main>
  if (!session) return <WrongCode code={code} />
  if (!me) return <NameStep session={session} participants={participants} myId={myId} />

  return (
    <>
      <ConnectionBadge state={connection} />
      {me.group === null || me.group >= session.groupCount ? (
        <Lobby name={me.name} count={participants.length} title={session.title} />
      ) : (
        <MyGroup
          group={me.group}
          lateJoin={!!session.groupedAt && me.joinedAt > session.groupedAt}
          mates={participants.filter((p) => p.group === me.group && p.id !== me.id).map((p) => p.name)}
        />
      )}
    </>
  )
}

function WrongCode({ code }: { code: string }) {
  const navigate = useNavigate()
  const [value, setValue] = useState(code)
  return (
    <main className="phone-page">
      <Wordmark />
      <h1 className="join-h1">We couldn't find {code || 'that class'}.</h1>
      <p className="muted">Check the code on the screen at the front of the room.</p>
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        onSubmit={(e) => {
          e.preventDefault()
          navigate(`/join/${normalizeCode(value)}`)
        }}
      >
        <input className="input code" value={value} onChange={(e) => setValue(e.target.value)} autoCapitalize="characters" />
        <button className="btn block">Try again</button>
      </form>
      <Link to="/" className="muted">
        Back
      </Link>
    </main>
  )
}

function NameStep({ session, participants, myId }: { session: Session; participants: Participant[]; myId: string }) {
  const { code } = session
  const [name, setName] = useState(rememberedName)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const trimmed = name.trim()

  async function join(e: React.FormEvent) {
    e.preventDefault()
    if (!trimmed) return
    setBusy(true)
    setError('')
    try {
      // Late joiners skip the lobby and go straight into the smallest group.
      const group = session.status === 'grouped' ? smallestGroup(participants, session.groupCount) : null
      rememberName(trimmed)
      await store.upsertParticipant({ id: myId, code, name: trimmed, group, joinedAt: new Date().toISOString() })
    } catch (err) {
      setError('Could not join. Check your connection and try again.')
      console.error(err)
      setBusy(false)
    }
  }

  return (
    <main className="phone-page">
      <Wordmark />
      <div className="eyebrow">Joining {code}</div>
      <h1 className="join-h1">What should your classmates call you?</h1>
      <form onSubmit={join} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field">
          <div className="label-row">
            <label htmlFor="name">Name</label>
            <span className="visibility">Visible to your group</span>
          </div>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name is fine"
            autoComplete="given-name"
            maxLength={60}
            autoFocus
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn block" disabled={!trimmed || busy}>
          Join class
        </button>
      </form>
    </main>
  )
}

function Lobby({ name, count, title }: { name: string; count: number; title: string }) {
  return (
    <main className="phone-page lobby">
      <Wordmark />
      <div className="lobby-center">
        <div className="lobby-rings" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <h1 className="join-h1">You're in, {name}.</h1>
        <p className="muted">
          {title ? `${title}: ` : ''}
          {count} {count === 1 ? 'person has' : 'people have'} joined. Your color shows up here when the
          instructor sorts groups.
        </p>
      </div>
    </main>
  )
}

function MyGroup({ group, mates, lateJoin }: { group: number; mates: string[]; lateJoin: boolean }) {
  const g = groupIdentity(group)
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 900)
    return () => clearTimeout(t)
  }, [group])

  return (
    <main
      className="my-group"
      style={
        {
          '--c': g.color.base,
          '--cs': g.color.soft,
          background: `radial-gradient(120% 80% at 50% 30%, ${g.color.base}55 0%, ${g.color.deep} 70%)`,
        } as React.CSSProperties
      }
    >
      <div className="eyebrow">Your color</div>
      <div key={group} className="orb">
        <span className="orb-symbol" aria-hidden>
          {g.symbol}
        </span>
      </div>
      <div className="my-group-text">
        <div className="youre">You're</div>
        <div className="group-name">
          {g.name} <span aria-hidden>{g.symbol}</span>
        </div>
        <p>
          {lateJoin
            ? `Your ${g.name} group is already together. Look for phones showing ${g.name} ${g.symbol} and jump in.`
            : `Hold your phone up and find the others showing ${g.name} ${g.symbol}.`}
        </p>
      </div>
      {revealed && (
        <div className="mates">
          <div className="eyebrow">In your group</div>
          {mates.length === 0 ? (
            <p className="muted">You're first. Others will appear here.</p>
          ) : (
            <ul>
              {mates.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  )
}
