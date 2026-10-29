import { describe, expect, it } from 'vitest'
import { aspectsBySpiritId } from './aspects'
import { adversaries } from './adversaries'
import { adversaryOrder, getMatchupTier, matchupRatings } from './matchups'
import { spirits } from './spirits'

describe('spirit data', () => {
  it('contains all 37 spirits from the wiki with unique identifiers', () => {
    expect(spirits).toHaveLength(37)
    expect(new Set(spirits.map((spirit) => spirit.id)).size).toBe(37)
  })

  it('includes expansion, complexity, and a wiki page for each spirit', () => {
    expect(
      spirits.every(
        (spirit) =>
          spirit.expansion.length > 0 &&
          spirit.complexity.length > 0 &&
          spirit.artworkPageUrl.startsWith(
            'https://spiritislandwiki.com/index.php/File:',
          ),
      ),
    ).toBe(true)
  })

  it('does not bundle copyrighted spirit artwork', () => {
    expect(spirits.every((spirit) => spirit.artworkUrl === null)).toBe(true)
  })

  it('includes all 31 aspects with valid parent spirits and unique identifiers', () => {
    const aspects = spirits.flatMap((spirit) => spirit.aspects)
    const spiritIds = new Set(spirits.map((spirit) => spirit.id))

    expect(aspects).toHaveLength(31)
    expect(new Set(aspects.map((aspect) => aspect.id)).size).toBe(31)
    expect(
      Object.keys(aspectsBySpiritId).every((spiritId) =>
        spiritIds.has(spiritId),
      ),
    ).toBe(true)
    expect(
      aspects.every(
        (aspect) =>
          aspect.name.length > 0 &&
          aspect.expansion.length > 0 &&
          ['+', '=', '−'].includes(aspect.complexityModifier),
      ),
    ).toBe(true)
  })

  it('lists the three River Surges in Sunlight aspects', () => {
    const river = spirits.find(
      (spirit) => spirit.id === 'river-surges-in-sunlight',
    )

    expect(river?.aspects.map((aspect) => aspect.name).sort()).toEqual([
      'Haven',
      'Sunshine',
      'Travel',
    ])
  })

  it('includes a matchup tier for every spirit, aspect, and adversary', () => {
    const expectedEntityIds = spirits.flatMap((spirit) => [
      spirit.id,
      ...spirit.aspects.map((aspect) => aspect.id),
    ])

    expect(Object.keys(matchupRatings).sort()).toEqual(
      expectedEntityIds.sort(),
    )
    expect(adversaryOrder).toHaveLength(adversaries.length)
    expect(new Set(adversaryOrder)).toEqual(
      new Set(adversaries.map((adversary) => adversary.id)),
    )
    expect(
      expectedEntityIds.every((entityId) =>
        adversaryOrder.every(
          (adversaryId) => getMatchupTier(entityId, adversaryId) !== null,
        ),
      ),
    ).toBe(true)
    expect(
      Object.values(matchupRatings).every(
        (ratings) =>
          ratings.length === adversaries.length &&
          ratings.every((rating) => /^[FDCBAS]\*?$/.test(rating)),
      ),
    ).toBe(true)
  })

  it('returns the selected aspect matchup tier and preserves special markers', () => {
    expect(getMatchupTier('river-surges-in-sunlight', 'sweden')).toBe('C*')
    expect(getMatchupTier('river-travel', 'sweden')).toBe('B*')
    expect(getMatchupTier('river-haven', 'scotland')).toBe('A')
    expect(getMatchupTier('river-surges-in-sunlight', 'not-an-adversary')).toBeNull()
  })
})
