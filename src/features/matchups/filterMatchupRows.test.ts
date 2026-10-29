import { describe, expect, it } from 'vitest'
import type { MatchupAxisRow } from './filterMatchupRows'
import {
  filterMatchupRows,
  sortMatchupRows,
} from './filterMatchupRows'
import { getMatchupTier } from '../../data/matchups'

const rows: readonly MatchupAxisRow[] = [
  {
    id: 'river-surges-in-sunlight',
    spiritName: 'River Surges in Sunlight',
    name: null,
    complexity: 'Low',
  },
  {
    id: 'river-haven',
    spiritName: 'River Surges in Sunlight',
    name: 'Haven',
    complexity: 'Low',
  },
  {
    id: 'starlight-seeks-its-form',
    spiritName: 'Starlight Seeks Its Form',
    name: null,
    complexity: 'Very High',
  },
]

describe('filterMatchupRows', () => {
  it('filters by spirit name, including its aspect rows', () => {
    expect(filterMatchupRows(rows, 'river', 'All').map((row) => row.id)).toEqual([
      'river-surges-in-sunlight',
      'river-haven',
    ])
  })

  it('filters by aspect name and complexity together', () => {
    expect(
      filterMatchupRows(rows, 'haven', 'Low').map((row) => row.id),
    ).toEqual(['river-haven'])
    expect(filterMatchupRows(rows, 'haven', 'High')).toEqual([])
  })

  it('returns all rows for empty query and all complexities', () => {
    expect(filterMatchupRows(rows, '  ', 'All')).toEqual(rows)
  })
})

describe('sortMatchupRows', () => {
  it('sorts by complexity in complexity order and reverses on descending', () => {
    const ascending = sortMatchupRows(rows, 'complexity', 'ascending', () => null)
    const descending = sortMatchupRows(rows, 'complexity', 'descending', () => null)

    expect(ascending.map((row) => row.complexity)).toEqual([
      'Low',
      'Low',
      'Very High',
    ])
    expect(descending.map((row) => row.complexity)).toEqual([
      'Very High',
      'Low',
      'Low',
    ])
  })

  it('sorts spirit and aspect names alphabetically', () => {
    expect(
      sortMatchupRows(rows, 'spirit', 'ascending', () => null).map(
        (row) => (row.name ? `${row.spiritName} ${row.name}` : row.spiritName),
      ),
    ).toEqual([
      'River Surges in Sunlight',
      'River Surges in Sunlight Haven',
      'Starlight Seeks Its Form',
    ])
  })

  it('sorts a matchup column by grade and then its asterisk marker', () => {
    const matchupRows = [
      rows[0]!,
      { ...rows[0]!, id: 'travel', name: 'Travel' },
      { ...rows[0]!, id: 'sunshine', name: 'Sunshine' },
    ]
    const tiers: Readonly<Record<string, string>> = {
      'river-surges-in-sunlight': 'C*',
      travel: 'B*',
      sunshine: 'B',
    }
    const getTier = (row: MatchupAxisRow) =>
      tiers[row.id] ?? getMatchupTier(row.id, 'sweden')

    expect(
      sortMatchupRows(matchupRows, 'sweden', 'ascending', getTier).map(
        (row) => row.id,
      ),
    ).toEqual(['river-surges-in-sunlight', 'sunshine', 'travel'])
    expect(
      sortMatchupRows(matchupRows, 'sweden', 'descending', getTier).map(
        (row) => row.id,
      ),
    ).toEqual(['travel', 'sunshine', 'river-surges-in-sunlight'])
  })
})
