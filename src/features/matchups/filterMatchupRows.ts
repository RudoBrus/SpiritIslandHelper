import type { SpiritComplexity } from '../../types/spirit'

export type MatchupAxisRow = {
  readonly id: string
  readonly spiritName: string
  readonly name: string | null
  readonly complexity: SpiritComplexity
}

export type MatchupComplexityFilter = 'All' | SpiritComplexity
export type MatchupSortDirection = 'ascending' | 'descending'

const complexityOrder: readonly SpiritComplexity[] = [
  'Low',
  'Moderate',
  'High',
  'Very High',
]

const tierOrder: Readonly<Record<string, number>> = {
  F: 0,
  D: 1,
  C: 2,
  B: 3,
  A: 4,
  S: 5,
}

export function filterMatchupRows(
  rows: readonly MatchupAxisRow[],
  spiritQuery: string,
  complexity: MatchupComplexityFilter,
): readonly MatchupAxisRow[] {
  const normalizedQuery = spiritQuery.trim().toLowerCase()

  return rows.filter((row) => {
    const matchesSpirit =
      normalizedQuery.length === 0 ||
      row.spiritName.toLowerCase().includes(normalizedQuery) ||
      (row.name?.toLowerCase().includes(normalizedQuery) ?? false)
    const matchesComplexity =
      complexity === 'All' || row.complexity === complexity

    return matchesSpirit && matchesComplexity
  })
}

export function sortMatchupRows(
  rows: readonly MatchupAxisRow[],
  column: string,
  direction: MatchupSortDirection,
  getTier: (row: MatchupAxisRow, adversaryId: string) => string | null,
): readonly MatchupAxisRow[] {
  const directionMultiplier = direction === 'ascending' ? 1 : -1

  return rows
    .map((row, index) => ({ row, index }))
    .sort(({ row: left, index: leftIndex }, { row: right, index: rightIndex }) => {
      let comparison = 0

      if (column === 'complexity') {
        comparison =
          complexityOrder.indexOf(left.complexity) -
          complexityOrder.indexOf(right.complexity)
      } else if (column === 'spirit') {
        comparison = getRowName(left).localeCompare(getRowName(right))
      } else {
        const leftTier = getTier(left, column)
        const rightTier = getTier(right, column)

        if (leftTier === null || rightTier === null) {
          if (leftTier !== rightTier) {
            return leftTier === null ? 1 : -1
          }
        } else {
          comparison =
            (tierOrder[leftTier.charAt(0)] ?? -1) -
            (tierOrder[rightTier.charAt(0)] ?? -1)

          if (comparison === 0) {
            comparison = Number(leftTier.endsWith('*')) -
              Number(rightTier.endsWith('*'))
          }
        }
      }

      return comparison === 0
        ? leftIndex - rightIndex
        : comparison * directionMultiplier
    })
    .map(({ row }) => row)
}

function getRowName(row: MatchupAxisRow): string {
  return row.name ? `${row.spiritName} ${row.name}` : row.spiritName
}
