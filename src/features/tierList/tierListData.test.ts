import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  defaultTierPlacements,
  defaultTierByItemId,
  readTierPlacements,
  tierListItems,
} from './tierListData'

describe('general tier list data', () => {
  it('includes a local image for every spirit and aspect', () => {
    expect(tierListItems).toHaveLength(68)
    const missingImages = tierListItems
      .filter(
        (item) =>
          !existsSync(
            resolve(
              process.cwd(),
              'public',
              item.imageUrl.split('/').slice(-3).join('/'),
            ),
          ),
      )
      .map((item) => `${item.id}: ${item.imageUrl}`)

    expect(missingImages).toEqual([])
  })

  it('seeds the aspect placements from the supplied tier list', () => {
    expect(defaultTierByItemId['green-regrowth']).toBe('X')
    expect(defaultTierByItemId['earth-nourishing']).toBe('S')
    expect(defaultTierByItemId['river-travel']).toBe('A')
    expect(defaultTierByItemId['bringer-violence']).toBe('B')
    expect(defaultTierByItemId['shadows-dark-fire']).toBe('C')
    expect(defaultTierByItemId['shadows-foreboding']).toBe('D')
    expect(defaultTierByItemId['river-sunshine']).toBe('F')
  })

  it('keeps the initial order from the supplied tier list', () => {
    expect(defaultTierPlacements.X.slice(0, 4)).toEqual([
      'fractured-days-split-the-sky',
      'stones-unyielding-defiance',
      'green-regrowth',
      'a-spread-of-rampant-green',
    ])
    expect(defaultTierPlacements.S).toEqual([
      'starlight-seeks-its-form',
      'many-minds-move-as-one',
      'downpour-drenches-the-world',
      'relentless-gaze-of-the-sun',
      'earth-nourishing',
      'memory-intensify',
      'keeper-of-the-forbidden-wilds',
      'finder-of-paths-unseen',
    ])
    expect(defaultTierPlacements.A).toEqual([
      'towering-roots-of-the-jungle',
      'river-travel',
      'grinning-trickster-stirs-up-trouble',
      'volcano-looming-high',
      'eyes-watch-from-the-trees',
      'lightning-sparking',
      'serpent-slumbering-beneath-the-island',
      'green-tangles',
      'lure-of-the-deep-wilderness',
    ])
    expect(defaultTierPlacements.B).toEqual([
      'ember-eyed-behemoth',
      'wandering-voice-keens-delirium',
      'fangs-encircle',
      'fangs-unconstrained',
      'sharp-fangs-behind-the-leaves',
      'vengeance-as-a-burning-plague',
      'rising-heat-of-stone-and-sand',
      'wildfire-transforming',
      'bringer-enticing',
      'bringer-violence',
      'breath-of-darkness-down-your-spine',
      'thunderspeaker',
      'river-surges-in-sunlight',
      'lightning-wind',
      'wounded-waters-bleeding',
      'sun-bright-whirlwind',
      'shroud-stranded',
      'lure-lair',
      'fathomless-mud-of-the-swamp',
      'river-haven',
      'keeper-spreading-hostility',
    ])
    expect(defaultTierPlacements.C.slice(0, 6)).toEqual([
      'serpent-locus',
      'earth-might',
      'ocean-deeps',
      'oceans-hungry-grasp',
      'lightning-pandemonium',
      'lightnings-swift-strike',
    ])
    expect(
      Object.values(defaultTierPlacements).reduce(
        (total, itemIds) => total + itemIds.length,
        0,
      ),
    ).toBe(tierListItems.length)
    expect(
      new Set(Object.values(defaultTierPlacements).flat()).size,
    ).toBe(tierListItems.length)
    expect(new Set(Object.values(defaultTierPlacements).flat())).toEqual(
      new Set(tierListItems.map((item) => item.id)),
    )
  })

  it('validates saved ordered tiers and appends missing tiles to their defaults', () => {
    const saved = readTierPlacements(
      JSON.stringify({
        X: ['lightnings-swift-strike', 'unknown', 'lightnings-swift-strike'],
        S: 'not-a-tier',
      }),
    )

    expect(saved?.X[0]).toBe('lightnings-swift-strike')
    expect(saved?.X.filter((itemId) => itemId === 'lightnings-swift-strike'))
      .toHaveLength(1)
    expect(saved?.X).toContain('fractured-days-split-the-sky')
    expect(saved?.B).toContain('river-surges-in-sunlight')
    expect(readTierPlacements(null)).toBeNull()
  })
})
