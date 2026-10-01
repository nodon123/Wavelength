import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wordmark } from '../components/Common'
import { generateCode, isValidCode, normalizeCode } from '../lib/code'
import { CodeTakenError } from '../lib/errors'
import { markHosting } from '../lib/identity'
import { store } from '../lib/store'

export default function HostNew() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [code, setCode] = useState(() => generateCode())
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const clean = normalizeCode(code)

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidCode(clean)) {
      setError('Use 3 to 10 letters or numbers.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await store.createSession({
        code: clean,
        title: title.trim(),
        groupCount: 1,
        status: 'lobby',
        groupedAt: null,
        createdAt: new Date().toISOString(),
      })
      markHosting(clean)
      navigate(`/host/${clean}`)
    } catch (err) {
      setError(err instanceof CodeTakenError ? `${clean} is taken. Try another code.` : String(err))
      setBusy(false)
    }
  }

  return (
    <main className="phone-page">
      <Wordmark />
      <h1 style={{ fontSize: 32, margin: 0, fontWeight: 900, letterSpacing: -0.5 }}>Start a class session</h1>
      <form onSubmit={create} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="field">
          <label htmlFor="title">Class name (optional)</label>
          <input
            id="title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="BIO 101, Tuesday"
          />
        </div>
        <div className="field">
          <label htmlFor="code">Join code</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id="code"
              className="input code"
              style={{ flex: 1, minWidth: 0 }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={10}
              autoCapitalize="characters"
              autoComplete="off"
            />
            <button type="button" className="btn ghost" onClick={() => setCode(generateCode())}>
              New
            </button>
          </div>
          <span className="hint">Type your own, like BIO101, or keep the generated one.</span>
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn block" disabled={busy}>
          Create session
        </button>
      </form>
      {store.kind === 'local' && (
        <p className="hint">
          Demo mode: no database is connected, so this only syncs between tabs in this browser. Open the join
          link in another tab to act as a student.
        </p>
      )}
    </main>
  )
}
