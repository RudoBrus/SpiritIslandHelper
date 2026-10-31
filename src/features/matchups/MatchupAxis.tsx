import { useState } from 'react'
import { adversaries } from '../../data/adversaries'
import { adversaryOrder, getMatchupTier } from '../../data/matchups'
import { spirits } from '../../data/spirits'
import type { SpiritComplexity } from '../../types/spirit'
import {
  filterMatchupRows,
  sortMatchupRows,
  type MatchupAxisRow,
  type MatchupComplexityFilter,
  type MatchupSortDirection,
} from './filterMatchupRows'

const complexities: readonly SpiritComplexity[] = [
  'Low',
  'Moderate',
  'High',
  'Very High',
]

function isSpiritComplexity(value: string): value is SpiritComplexity {
  return complexities.some((complexity) => complexity === value)
}

const tierColors: Record<string, string> = {
  F: 'border-rose-300/20 bg-rose-950/60 text-rose-100',
  D: 'border-orange-300/20 bg-orange-950/50 text-orange-100',
  C: 'border-amber-200/20 bg-amber-950/40 text-amber-100',
  B: 'border-sky-200/20 bg-sky-950/50 text-sky-100',
  A: 'border-emerald-200/20 bg-emerald-950/50 text-emerald-100',
  S: 'border-cyan-200/20 bg-cyan-950/60 text-cyan-100',
}

const orderedAdversaries = adversaryOrder.map((id) => {
  const adversary = adversaries.find((item) => item.id === id)

  if (!adversary) {
    throw new Error(`Missing adversary data for matchup axis: ${id}`)
  }

  return adversary
})

const matchupRows: readonly MatchupAxisRow[] = spirits.flatMap((spirit) => [
  {
    id: spirit.id,
    spiritName: spirit.name,
    name: null,
    complexity: spirit.complexity,
  },
  ...spirit.aspects.map((aspect) => ({
    id: aspect.id,
    spiritName: spirit.name,
    name: aspect.name,
    complexity: spirit.complexity,
  })),
])

function MatchupAxis() {
  const [selectedAdversaryId, setSelectedAdversaryId] = useState('all')
  const [spiritQuery, setSpiritQuery] = useState('')
  const [complexity, setComplexity] =
    useState<MatchupComplexityFilter>('All')
  const [sort, setSort] = useState<{
    readonly column: string
    readonly direction: MatchupSortDirection
  } | null>(null)

  const filteredRows = filterMatchupRows(matchupRows, spiritQuery, complexity)
  const visibleAdversaries =
    selectedAdversaryId === 'all'
      ? orderedAdversaries
      : orderedAdversaries.filter(
          (adversary) => adversary.id === selectedAdversaryId,
        )
  const visibleRows = sort
    ? sortMatchupRows(
        filteredRows,
        sort.column,
        sort.direction,
        (row, adversaryId) => getMatchupTier(row.id, adversaryId),
      )
    : filteredRows

  function toggleSort(column: string) {
    setSort((current) => ({
      column,
      direction:
        current?.column === column && current.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }))
  }

  function renderSortHeader(
    column: string,
    label: string,
    className: string,
    key?: string,
  ) {
    const direction = sort?.column === column ? sort.direction : null
    const sortDescription = direction
      ? `sorted ${direction}`
      : 'not sorted'

    return (
      <th
        key={key}
        scope="col"
        aria-sort={direction ?? 'none'}
        className={className}
      >
        <button
          type="button"
          onClick={() => toggleSort(column)}
          aria-label={`Sort by ${label}; ${sortDescription}`}
          className="flex min-h-8 w-full items-center justify-between gap-2 text-left hover:text-emerald-200 focus-visible:outline-emerald-300"
        >
          <span>{label}</span>
          <span aria-hidden="true" className="text-emerald-200">
            {direction === 'ascending'
              ? '↑'
              : direction === 'descending'
                ? '↓'
                : '↕'}
          </span>
        </button>
      </th>
    )
  }

  return (
    <section
      aria-labelledby="matchup-axis-title"
      className="rounded-none border-y border-white/10 bg-[#17211b]/90 p-3 shadow-2xl shadow-black/10 sm:rounded-2xl sm:border sm:p-7"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="matchup-axis-title" className="text-xl font-semibold">
            Complete matchup axis
          </h2>
          <p className="mt-1 text-sm text-[#aeb9ad]">
            Matchup tiers for spirits and their aspects against level 6
            adversaries.
          </p>
        </div>
        <a
          href="https://www.reddit.com/r/spiritisland/comments/1bqer7k/reds_matchup_axis_5_star_system/"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-emerald-200 underline decoration-emerald-200/40 underline-offset-2 hover:text-emerald-100"
        >
          Source and rating guide
        </a>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-3">
        <label className="col-span-2 flex flex-col gap-2 text-sm font-medium text-[#d9e1d5] sm:col-span-1">
          Adversary
          <select
            value={selectedAdversaryId}
            onChange={(event) => setSelectedAdversaryId(event.target.value)}
            className="min-h-11 rounded-lg border border-white/15 bg-[#101814] px-3 text-base text-white focus-visible:outline-emerald-300"
          >
            <option value="all">All adversaries</option>
            {orderedAdversaries.map((adversary) => (
              <option key={adversary.id} value={adversary.id}>
                {adversary.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[#d9e1d5]">
          Spirit or aspect
          <input
            type="search"
            value={spiritQuery}
            onChange={(event) => setSpiritQuery(event.target.value)}
            placeholder="Search by name"
            className="min-h-11 rounded-lg border border-white/15 bg-[#101814] px-3 text-base text-white placeholder:text-[#829084] focus-visible:outline-emerald-300"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[#d9e1d5]">
          Spirit complexity
          <select
            value={complexity}
            onChange={(event) => {
              const value = event.target.value
              setComplexity(
                value === 'All' || isSpiritComplexity(value) ? value : 'All',
              )
            }}
            className="min-h-11 rounded-lg border border-white/15 bg-[#101814] px-3 text-base text-white focus-visible:outline-emerald-300"
          >
            <option value="All">All complexities</option>
            {complexities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 text-sm text-[#aeb9ad]" aria-live="polite">
        Showing {visibleRows.length} of {matchupRows.length} spirit and aspect
        matchups.
      </p>

      <div
        className="-mx-3 mt-3 overflow-x-auto border-y border-white/10 sm:mx-0 sm:rounded-xl sm:border"
        tabIndex={0}
        role="region"
        aria-label="Scrollable matchup table"
      >
        <table
          className={`w-full border-collapse text-left text-sm ${
            visibleAdversaries.length > 1
              ? 'min-w-[40rem] sm:min-w-[48rem]'
              : 'min-w-full sm:min-w-[48rem]'
          }`}
        >
          <thead className="bg-[#101814] text-xs uppercase tracking-wide text-[#b8c2b7]">
            <tr>
              {renderSortHeader(
                'spirit',
                'Spirit',
                'sticky left-0 z-10 w-24 min-w-24 max-w-24 border-b border-white/10 bg-[#101814] px-2 py-3 sm:w-56 sm:min-w-56 sm:max-w-none sm:px-3',
              )}
              {visibleAdversaries.map((adversary) =>
                renderSortHeader(
                    adversary.id,
                    adversary.name,
                    'min-w-16 border-b border-white/10 px-1.5 py-3 sm:min-w-28 sm:px-3',
                    adversary.id,
                  ),
              )}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]"
              >
                <th
                  scope="row"
                  className="sticky left-0 z-10 w-24 min-w-24 max-w-24 break-words bg-[#17211b] px-2 py-2.5 font-medium text-[#e2e8de] sm:w-56 sm:min-w-56 sm:max-w-none sm:px-3"
                >
                  <span className="block">{row.spiritName}</span>
                  {row.name && (
                    <span className="mt-0.5 block pl-3 text-xs text-[#aeb9ad]">
                      {row.name}
                    </span>
                  )}
                </th>
                {visibleAdversaries.map((adversary) => {
                  const tier = getMatchupTier(row.id, adversary.id)

                  return (
                    <td
                      key={adversary.id}
                      className="px-1 py-2 text-center sm:px-3"
                      title={
                        tier
                          ? `Tier ${tier}${tier.endsWith('*') ? ' — asterisk marker' : ''}`
                          : 'No matchup rating'
                      }
                    >
                      {tier ? (
                        <span
                          aria-label={`Tier ${tier}`}
                          className={`inline-flex min-w-9 justify-center rounded-md border px-2 py-1 font-semibold ${tierColors[tier.charAt(0)]}`}
                        >
                          {tier}
                        </span>
                      ) : (
                        <span aria-label="No rating" className="text-[#829084]">
                          —
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td
                  colSpan={visibleAdversaries.length + 1}
                  className="px-4 py-10 text-center text-[#aeb9ad]"
                >
                  No spirits or aspects match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-[#95a294] sm:hidden">
        Swipe horizontally to see more adversaries.
      </p>

      <p className="mt-4 text-xs leading-5 text-[#95a294]">
        F, D, C, B, A, and S run from weakest to strongest. An asterisk marks a
        matchup that may be harder to achieve at its listed tier. Aspect rows
        use the parent spirit&apos;s complexity.
      </p>
    </section>
  )
}

export default MatchupAxis
