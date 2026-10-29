import { describe, expect, it } from 'vitest'
import { spirits } from '../../data/spirits'
import type { SpiritComplexity } from '../../types/spirit'
import { randomizeSpirits } from './randomizeSpirits'

const allComplexities: readonly SpiritComplexity[] = [
  'Low',
  'Moderate',
  'High',
  'Very High',
]

describe('randomizeSpirits', () => {
  it('selects one distinct eligible spirit for every player', () => {
    const preferences: readonly (readonly SpiritComplexity[])[] = [
      ['Low'],
      ['Moderate', 'High'],
      ['Very High'],
    ]

    const results = randomizeSpirits(spirits, preferences, () => 0.5)

    expect(results).toHaveLength(3)
    expect(new Set(results?.map((spirit) => spirit.id)).size).toBe(3)
    expect(
      results?.every((spirit, index) =>
        preferences[index]?.includes(spirit.complexity),
      ),
    ).toBe(true)
  })

  it('returns null when the selected complexities cannot provide unique spirits', () => {
    const singleLowSpirit = spirits.filter(
      (spirit) => spirit.complexity === 'Low',
    ).slice(0, 1)

    expect(
      randomizeSpirits(singleLowSpirit, [['Low'], ['Low']], () => 0),
    ).toBeNull()
  })

  it('returns no results when there are no players', () => {
    expect(randomizeSpirits(spirits, [], () => 0)).toEqual([])
  })

  it('supports all complexity levels for every player', () => {
    const results = randomizeSpirits(
      spirits,
      [allComplexities, allComplexities],
      () => 0.25,
    )

    expect(results).toHaveLength(2)
    expect(new Set(results?.map((spirit) => spirit.id)).size).toBe(2)
  })
})
