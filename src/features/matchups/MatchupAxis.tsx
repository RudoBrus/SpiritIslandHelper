import { useEffect, useRef, useState } from 'react'
import { adversaries } from '../../data/adversaries'
import { adversaryOrder, getMatchupTier } from '../../data/matchups'
import { spirits } from '../../data/spirits'
import type { SpiritComplexity } from '../../types/spirit'
import { matchupTierColors } from './matchupTierStyles'
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
  const tableRegionRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const tableHeaderRef = useRef<HTMLTableSectionElement>(null)
  const [stickyHeader, setStickyHeader] = useState<{
    readonly left: number
    readonly width: number
    readonly tableWidth: number
    readonly columnWidths: readonly number[]
    readonly horizontalScroll: number
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
    headerOptions?: {
      readonly horizontalOffset?: number
      readonly inactive?: boolean
    },
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
        style={
          headerOptions?.horizontalOffset && column === 'spirit'
            ? {
                transform: `translateX(${headerOptions.horizontalOffset}px)`,
              }
            : undefined
        }
      >
        <button
          type="button"
          tabIndex={headerOptions?.inactive ? -1 : undefined}
          onClick={() => toggleSort(column)}
          aria-label={`Sort by ${label}; ${sortDescription}`}
          className={`flex min-h-8 w-full items-center justify-between gap-2 text-left hover:text-emerald-200 focus-visible:outline-emerald-300 ${
            headerOptions?.inactive ? 'pointer-events-none' : ''
          }`}
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

  useEffect(() => {
    const regionElement = tableRegionRef.current
    const tableElement = tableRef.current
    const headerElement = tableHeaderRef.current

    if (!regionElement || !tableElement || !headerElement) {
      return
    }

    let animationFrame = 0

    function updateStickyHeader() {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => {
        const region = tableRegionRef.current
        const table = tableRef.current
        const header = tableHeaderRef.current

        if (!region || !table || !header) {
          setStickyHeader(null)
          return
        }

        const regionRect = region.getBoundingClientRect()
        const headerRect = header.getBoundingClientRect()
        const shouldStick =
          headerRect.bottom <= 0 && regionRect.bottom > headerRect.height

        if (!shouldStick) {
          setStickyHeader(null)
          return
        }

        setStickyHeader({
          left: regionRect.left,
          width: regionRect.width,
          tableWidth: table.getBoundingClientRect().width,
          columnWidths: Array.from(header.querySelectorAll('th')).map(
            (cell) => cell.getBoundingClientRect().width,
          ),
          horizontalScroll: region.scrollLeft,
        })
      })
    }

    window.addEventListener('scroll', updateStickyHeader, { passive: true })
    window.addEventListener('resize', updateStickyHeader)
    regionElement.addEventListener('scroll', updateStickyHeader, {
      passive: true,
    })

    const resizeObserver = new ResizeObserver(updateStickyHeader)
    resizeObserver.observe(regionElement)
    resizeObserver.observe(tableElement)
    updateStickyHeader()

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', updateStickyHeader)
      window.removeEventListener('resize', updateStickyHeader)
      regionElement.removeEventListener('scroll', updateStickyHeader)
      resizeObserver.disconnect()
    }
  }, [complexity, selectedAdversaryId, spiritQuery, sort, visibleRows.length])

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

      <div className="relative">
        {stickyHeader && (
          <div
          className="fixed top-0 z-50 overflow-hidden border-y border-white/10 bg-[#101814] sm:rounded-xl sm:border"
          style={{
            left: stickyHeader.left,
            width: stickyHeader.width,
          }}
          >
          <table
            className="table-fixed border-collapse text-left text-sm"
            style={{
              width: stickyHeader.tableWidth,
              transform: `translateX(-${stickyHeader.horizontalScroll}px)`,
            }}
          >
            <colgroup>
              {stickyHeader.columnWidths.map((width, index) => (
                <col key={index} style={{ width }} />
              ))}
            </colgroup>
          <thead className="bg-[#101814] text-xs uppercase tracking-wide text-[#b8c2b7]">
            <tr>
              {renderSortHeader(
                'spirit',
                'Spirit',
                  'sticky left-0 z-30 border-b border-white/10 bg-[#101814] px-2 py-3',
                  undefined,
                  { horizontalOffset: stickyHeader.horizontalScroll },
              )}
              {visibleAdversaries.map((adversary) =>
                renderSortHeader(
                  adversary.id,
                  adversary.name,
                    'border-b border-white/10 px-1.5 py-3',
                  adversary.id,
                ),
              )}
            </tr>
          </thead>
          </table>
          </div>
        )}
        <div
          className="-mx-3 mt-3 overflow-x-auto border-y border-white/10 sm:mx-0 sm:rounded-xl sm:border"
          tabIndex={0}
          role="region"
          aria-label="Scrollable matchup table"
          ref={tableRegionRef}
        >
          <table
          ref={tableRef}
          className={`w-full border-collapse text-left text-sm ${
              visibleAdversaries.length > 1
                ? 'min-w-[40rem] sm:min-w-[48rem]'
                : 'min-w-full sm:min-w-[48rem]'
            }`}
          >
          <thead
            ref={tableHeaderRef}
            className={stickyHeader ? 'invisible' : ''}
            aria-hidden={stickyHeader !== null}
          >
            <tr>
              {renderSortHeader(
                'spirit',
                'Spirit',
                'sticky left-0 w-24 min-w-24 max-w-24 border-b border-white/10 px-2 py-3 sm:w-56 sm:min-w-56 sm:max-w-none sm:px-3',
                'spirit-placeholder',
                { inactive: stickyHeader !== null },
              )}
              {visibleAdversaries.map((adversary) =>
                renderSortHeader(
                  adversary.id,
                  adversary.name,
                  'min-w-16 border-b border-white/10 px-1.5 py-3 sm:min-w-28 sm:px-3',
                  `${adversary.id}-placeholder`,
                  { inactive: stickyHeader !== null },
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
                          className={`inline-flex min-w-9 justify-center rounded-md border px-2 py-1 font-semibold ${matchupTierColors[tier.charAt(0)]}`}
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
      </div>

      <p className="mt-4 text-xs leading-5 text-[#95a294]">
        F, D, C, B, A, and S run from weakest to strongest. An asterisk marks
        matchups where it can be difficult to play the spirit at the level
        needed to reach that tier, so it may feel weaker in practice.{' '}
        <a
          href="https://www.reddit.com/r/spiritisland/comments/1bqer7k/reds_matchup_axis_5_star_system/"
          target="_blank"
          rel="noreferrer"
          className="text-emerald-200 underline decoration-emerald-200/40 underline-offset-2 hover:text-emerald-100"
        >
          Source and rating guide
        </a>
      </p>
    </section>
  )
}

export default MatchupAxis
