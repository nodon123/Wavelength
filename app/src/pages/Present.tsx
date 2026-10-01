import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ConnectionBadge, GroupChip, Wordmark } from '../components/Common'
import { joinUrl } from '../lib/code'
import { useSession } from '../lib/useSession'
import './present.css'

// Projector view, sized to read from the back row.
export default function Present() {
  const { code = '' } = useParams()
  const { session, participants, connection } = useSession(code)
  const [showGroups, setShowGroups] = useState(true)
  const url = joinUrl(code)
  const grouped = session?.status === 'grouped'
  const groupCount = session?.groupCount ?? 1

  return (
    <main className="present">
      <ConnectionBadge state={connection} />
      <div className="present-top">
        <Wordmark />
        <div className="present-controls">
          {grouped && (
            <button className="btn ghost small" onClick={() => setShowGroups((v) => !v)}>
              {showGroups ? 'Show join code' : 'Show groups'}
            </button>
          )}
          <button
            className="btn ghost small"
            onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())}
          >
            Full screen
          </button>
        </div>
      </div>

      {grouped && showGroups ? (
        <section className="present-groups">
          <h1>Find your group</h1>
          <p className="muted">No phone? Find your name here. Joining late? Code {code}.</p>
          <div className="present-group-grid">
            {Array.from({ length: groupCount }, (_, i) => (
              <div key={i} className="present-group">
                <GroupChip index={i} size="lg" />
                <ul>
                  {participants
                    .filter((p) => p.group === i)
                    .map((p) => (
                      <li key={p.id}>{p.name}</li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="present-join">
          <div className="present-join-text">
            <div className="eyebrow">Join at</div>
            <div className="present-url mono">{url.replace(/^https?:\/\//, '').replace(/\/join\/.*/, '')}</div>
            <div className="eyebrow" style={{ marginTop: 32 }}>
              Code
            </div>
            <div className="present-code mono">{code}</div>
            <div className="present-count">
              <span className="livedot" /> <strong>{participants.length}</strong> joined
            </div>
          </div>
          <div className="present-qr">
            <QRCodeSVG value={url} size={420} marginSize={2} />
            <span>Scan to join</span>
          </div>
        </section>
      )}
    </main>
  )
}
