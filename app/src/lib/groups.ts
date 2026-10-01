import type { Participant } from './types'

export interface GroupColor {
  key: string
  name: string
  base: string
  deep: string
  soft: string
}

// Same palette as the Claude Design prototype.
export const COLORS: GroupColor[] = [
  { key: 'teal', name: 'Teal', base: '#06b6a4', deep: '#022f2b', soft: '#7fe6da' },
  { key: 'purple', name: 'Purple', base: '#7a4dff', deep: '#1b0a55', soft: '#c4acff' },
  { key: 'coral', name: 'Coral', base: '#ff6b5e', deep: '#5a150e', soft: '#ffb3aa' },
  { key: 'blue', name: 'Blue', base: '#2e6bff', deep: '#081a4d', soft: '#9fb9ff' },
  { key: 'gold', name: 'Gold', base: '#f5a300', deep: '#4d3300', soft: '#ffd37a' },
]

// Every group also gets its own symbol so nobody has to rely on color alone.
const SYMBOLS = ['●', '▲', '■', '◆', '★', '✚', '⬢', '✱', '◐', '♥']

export const MAX_GROUPS = SYMBOLS.length
export const TARGET_GROUP_SIZE = 5

export interface GroupIdentity {
  index: number
  name: string
  symbol: string
  color: GroupColor
}

export function groupIdentity(index: number): GroupIdentity {
  const color = COLORS[index % COLORS.length]
  const round = Math.floor(index / COLORS.length)
  return {
    index,
    name: round === 0 ? color.name : `${color.name} ${round + 1}`,
    symbol: SYMBOLS[index % SYMBOLS.length],
    color,
  }
}

export function clampGroupCount(n: number): number {
  return Math.max(1, Math.min(MAX_GROUPS, Math.round(n)))
}

/** Suggested number of groups for a headcount, aiming for about five per group. */
export function suggestGroupCount(headcount: number): number {
  if (headcount < 4) return 1
  return clampGroupCount(Math.max(2, Math.round(headcount / TARGET_GROUP_SIZE)))
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Randomly deals participants into `groupCount` groups whose sizes differ by at most one. */
export function assignGroups(
  ids: string[],
  groupCount: number,
  random: () => number = Math.random,
): Record<string, number> {
  const g = clampGroupCount(groupCount)
  const result: Record<string, number> = {}
  shuffle(ids, random).forEach((id, i) => {
    result[id] = i % g
  })
  return result
}

export function groupSizes(participants: Participant[], groupCount: number): number[] {
  const sizes = new Array(clampGroupCount(groupCount)).fill(0)
  for (const p of participants) {
    if (p.group !== null && p.group < sizes.length) sizes[p.group]++
  }
  return sizes
}

/** The group a late joiner should go into: the smallest one (lowest index on ties). */
export function smallestGroup(participants: Participant[], groupCount: number): number {
  const sizes = groupSizes(participants, groupCount)
  return sizes.indexOf(Math.min(...sizes))
}

/** True when group sizes have drifted far enough apart that a rebalance is worth offering. */
export function isUnbalanced(participants: Participant[], groupCount: number): boolean {
  const sizes = groupSizes(participants, groupCount)
  return Math.max(...sizes) - Math.min(...sizes) >= 2
}

/**
 * Moves as few people as possible so group sizes differ by at most one.
 * People in groups that no longer exist (after the count shrinks) are moved first.
 */
export function rebalance(participants: Participant[], groupCount: number): Record<string, number> {
  const g = clampGroupCount(groupCount)
  const members: string[][] = Array.from({ length: g }, () => [])
  const homeless: string[] = []
  for (const p of participants) {
    if (p.group !== null && p.group < g) members[p.group].push(p.id)
    else homeless.push(p.id)
  }
  const moves: Record<string, number> = {}
  const place = (id: string) => {
    let min = 0
    for (let i = 1; i < g; i++) if (members[i].length < members[min].length) min = i
    members[min].push(id)
    moves[id] = min
  }
  homeless.forEach(place)
  for (;;) {
    let min = 0
    let max = 0
    for (let i = 1; i < g; i++) {
      if (members[i].length < members[min].length) min = i
      if (members[i].length > members[max].length) max = i
    }
    if (members[max].length - members[min].length < 2) break
    const id = members[max].pop()!
    members[min].push(id)
    moves[id] = min
  }
  return moves
}
