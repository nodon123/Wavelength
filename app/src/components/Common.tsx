import { COLORS, groupIdentity } from '../lib/groups'
import type { ConnectionState } from '../lib/store'

export function Wordmark() {
  return (
    <div className="wordmark">
      <span className="dots">
        {COLORS.map((c) => (
          <i key={c.key} style={{ background: c.base }} />
        ))}
      </span>
      Wavelength
    </div>
  )
}

export function ConnectionBadge({ state }: { state: ConnectionState }) {
  if (state === 'live') return null
  return (
    <div className="reconnecting" role="status">
      <span className="livedot" /> Reconnecting… your group is saved
    </div>
  )
}

export function GroupChip({ index, size = 'md' }: { index: number; size?: 'md' | 'lg' }) {
  const g = groupIdentity(index)
  const big = size === 'lg'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: big ? 12 : 8,
        padding: big ? '8px 18px' : '4px 12px',
        borderRadius: 999,
        background: g.color.base,
        color: '#fff',
        fontWeight: 800,
        fontSize: big ? 28 : 15,
      }}
    >
      <span className="symbol" aria-hidden>
        {g.symbol}
      </span>
      {g.name}
    </span>
  )
}
