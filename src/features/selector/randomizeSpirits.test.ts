import { describe, expect, it } from 'vitest'
import { spirits } from '../../data/spirits'
import type { SpiritComplexity } from '../../types/spirit'
import {
  applyGlobalComplexityFilter,
  excludeFMatchups,
  rerollSpirit,
  randomizeSpirits,
} from './randomizeSpirits'

const allComplexities: readonly SpiritComplexity[] = [
  'Low',
  'Moderate',
  'High',
  'Very High',
]

describe('randomizeSpirits', () => {
  it('applies global complexity exclusions to every player', () => {
    const preferences: readonly (readonly SpiritComplexity[])[] = [
      ['Low', 'Moderate'],
      ['Moderate', 'High'],
    ]

    expect(applyGlobalComplexityFilter(preferences, ['Moderate'])).toEqual([
      ['Moderate'],
      ['Moderate'],
    ])
  })

  it('excludes F-tier spirits for the selected adversary', () => {
    const candidates = excludeFMatchups(spirits, 'russia')

    expect(candidates.some((spirit) => spirit.id === 'river-sunshine')).toBe(
      false,
    )
    expect(candidates.every((spirit) => spirit.id !== 'fathomless-mud-of-the-swamp')).toBe(
      true,
    )
    expect(candidates.some((spirit) => spirit.id === 'river-surges-in-sunlight')).toBe(
      true,
    )
  })

  it('keeps all spirits eligible when no adversary is selected', () => {
    expect(excludeFMatchups(spirits, null)).toBe(spirits)
  })

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

  it('rerolls to an eligible spirit without choosing anyone else’s spirit', () => {
    const alreadySelected = new Set([
      'lightnings-swift-strike',
      'river-surges-in-sunlight',
    ])
    const rerolled = rerollSpirit(
      spirits,
      ['Low'],
      alreadySelected,
      () => 0,
    )

    expect(rerolled).not.toBeNull()
    expect(rerolled?.complexity).toBe('Low')
    expect(alreadySelected.has(rerolled?.id ?? '')).toBe(false)
  })

  it('returns null when no alternate eligible spirit is available', () => {
    const lowSpirits = spirits.filter((spirit) => spirit.complexity === 'Low')
    const alreadySelected = new Set(lowSpirits.map((spirit) => spirit.id))

    expect(rerollSpirit(spirits, ['Low'], alreadySelected, () => 0)).toBeNull()
  })
})
