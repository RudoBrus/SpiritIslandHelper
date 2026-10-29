import { describe, expect, it } from 'vitest'
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
})
