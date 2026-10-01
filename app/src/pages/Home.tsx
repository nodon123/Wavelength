import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wordmark } from '../components/Common'
import { normalizeCode } from '../lib/code'

export default function Home() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const clean = normalizeCode(code)

  return (
    <main className="phone-page" style={{ justifyContent: 'space-between' }}>
      <Wordmark />
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        onSubmit={(e) => {
          e.preventDefault()
          if (clean.length >= 3) navigate(`/join/${clean}`)
        }}
      >
        <h1 style={{ fontSize: 40, lineHeight: 1.05, margin: '0 0 8px', fontWeight: 900, letterSpacing: -1 }}>
          Find your people in this class.
        </h1>
        <div className="field">
          <label htmlFor="code">Class code</label>
          <input
            id="code"
            className="input code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="BIO101"
            autoCapitalize="characters"
            autoComplete="off"
            maxLength={12}
          />
          <span className="hint">It's on the screen at the front of the room.</span>
        </div>
        <button className="btn block" disabled={clean.length < 3}>
          Join
        </button>
      </form>
      <Link to="/host" className="muted" style={{ textAlign: 'center', fontSize: 15 }}>
        I'm the instructor →
      </Link>
    </main>
  )
}
