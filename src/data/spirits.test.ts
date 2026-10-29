import { describe, expect, it } from 'vitest'
import { aspectsBySpiritId } from './aspects'
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
})
