import { describe, expect, it } from 'vitest'
import { adversaries } from '../../data/adversaries'
import {
  randomizeAdversary,
  sortAdversariesByLevel6Difficulty,
} from './randomizeAdversary'

describe('randomizeAdversary', () => {
  it('sorts adversaries by level-6 difficulty, then name', () => {
    const sorted = sortAdversariesByLevel6Difficulty(adversaries)

    expect(sorted.map((adversary) => adversary.level6Difficulty)).toEqual([
      8, 10, 10, 10, 10, 10, 11, 11,
    ])
    expect(sorted[0]?.name).toBe('Sweden')
    expect(sorted[1]?.name).toBe('Brandenburg-Prussia')
    expect(sorted[2]?.name).toBe('France (Plantation Colony)')
  })

  it('randomly selects only from adversaries that are not excluded', () => {
    const excludedIds = new Set(adversaries.map((adversary) => adversary.id))
    excludedIds.delete('sweden')

    expect(randomizeAdversary(adversaries, excludedIds, () => 0)?.id).toBe(
      'sweden',
    )
  })

  it('returns null when every adversary is excluded', () => {
    const excludedIds = new Set(adversaries.map((adversary) => adversary.id))

    expect(randomizeAdversary(adversaries, excludedIds)).toBeNull()
  })
})
