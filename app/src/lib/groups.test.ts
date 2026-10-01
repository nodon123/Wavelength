import { describe, expect, it } from 'vitest'
import {
  assignGroups,
  groupIdentity,
  groupSizes,
  isUnbalanced,
  rebalance,
  smallestGroup,
  suggestGroupCount,
} from './groups'
import type { Participant } from './types'

const people = (groups: (number | null)[]): Participant[] =>
  groups.map((group, i) => ({ id: `p${i}`, code: 'X', name: `P${i}`, group, joinedAt: '' }))

const apply = (ps: Participant[], moves: Record<string, number>) =>
  ps.map((p) => (p.id in moves ? { ...p, group: moves[p.id] } : p))

describe('groups', () => {
  it('suggests about five per group', () => {
    expect(suggestGroupCount(2)).toBe(1)
    expect(suggestGroupCount(8)).toBe(2)
    expect(suggestGroupCount(24)).toBe(5)
    expect(suggestGroupCount(60)).toBe(10)
    expect(suggestGroupCount(300)).toBe(10)
  })

  it('deals everyone into evenly sized groups', () => {
    const ids = Array.from({ length: 23 }, (_, i) => `p${i}`)
    const result = assignGroups(ids, 5)
    expect(Object.keys(result)).toHaveLength(23)
    const sizes = groupSizes(apply(people(new Array(23).fill(null)), result), 5)
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1)
  })

  it('puts late joiners in the smallest group', () => {
    expect(smallestGroup(people([0, 0, 1, 2, 2]), 3)).toBe(1)
  })

  it('flags drift of two or more', () => {
    expect(isUnbalanced(people([0, 0, 1]), 2)).toBe(false)
    expect(isUnbalanced(people([0, 0, 0, 1]), 2)).toBe(true)
  })

  it('rebalances with few moves, including after the group count shrinks', () => {
    const ps = people([0, 0, 0, 0, 1, 2, 2])
    const moves = rebalance(ps, 3)
    expect(Object.keys(moves)).toHaveLength(1)
    const shrunk = rebalance(people([0, 1, 2, 3, 4, 4]), 3)
    const sizes = groupSizes(apply(people([0, 1, 2, 3, 4, 4]), shrunk), 3)
    expect(sizes.reduce((a, b) => a + b)).toBe(6)
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1)
  })

  it('names groups past five with a number and a distinct symbol', () => {
    expect(groupIdentity(0).name).toBe('Teal')
    expect(groupIdentity(5).name).toBe('Teal 2')
    expect(groupIdentity(5).symbol).not.toBe(groupIdentity(0).symbol)
  })
})
