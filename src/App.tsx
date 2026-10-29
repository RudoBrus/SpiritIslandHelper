import { useState } from 'react'
import type { Adversary } from './types/adversary'
import { getMatchupTier } from './data/matchups'
import { spirits } from './data/spirits'
import AdversarySelector from './features/selector/AdversarySelector'
import {
  applyGlobalComplexityFilter,
  rerollSpirit,
  randomizeSpirits,
} from './features/selector/randomizeSpirits'
import type { SpiritAspect, SpiritComplexity } from './types/spirit'

const complexities: readonly SpiritComplexity[] = [
  'Low',
  'Moderate',
  'High',
  'Very High',
]

const playerOptions = Array.from({ length: 6 }, (_, index) => index + 1)

const complexityModifierLabels: Record<SpiritAspect['complexityModifier'], string> = {
  '+': 'Increases complexity',
  '=': 'No complexity change',
  '−': 'Decreases complexity',
}

function App() {
  const [playerCount, setPlayerCount] = useState(1)
  const [availableComplexities, setAvailableComplexities] =
    useState<readonly SpiritComplexity[]>(complexities)
  const [playerComplexities, setPlayerComplexities] = useState<
    readonly (readonly SpiritComplexity[])[]
  >([complexities])
  const [selectedAdversary, setSelectedAdversary] =
    useState<Adversary | null>(null)
  const [results, setResults] = useState<
    | readonly {
        playerNumber: number
        spirit: (typeof spirits)[number]
        selectedAspectId: string | null
      }[]
    | null
  >(null)
  const [error, setError] = useState<string | null>(null)

  function changeAdversary(adversary: Adversary | null) {
    setSelectedAdversary(adversary)
    setResults(null)
    setError(null)
  }

  function changePlayerCount(count: number) {
    setPlayerCount(count)
    setPlayerComplexities((current) =>
      Array.from(
        { length: count },
        (_, index) => current[index] ?? complexities,
      ),
    )
    setResults(null)
    setError(null)
  }

  function toggleAvailableComplexity(complexity: SpiritComplexity) {
    setAvailableComplexities((current) =>
      current.includes(complexity)
        ? current.filter((item) => item !== complexity)
        : [...current, complexity],
    )
    setResults(null)
    setError(null)
  }

  function toggleComplexity(
    playerIndex: number,
    complexity: SpiritComplexity,
  ) {
    setPlayerComplexities((current) =>
      current.map((selected, index) => {
        if (index !== playerIndex) {
          return selected
        }

        return selected.includes(complexity)
          ? selected.filter((item) => item !== complexity)
          : [...selected, complexity]
      }),
    )
    setResults(null)
    setError(null)
  }

  function generateSelection() {
    if (!selectedAdversary) {
      setError('Pick an adversary before selecting spirits.')
      return
    }

    const selection = randomizeSpirits(
      spirits,
      applyGlobalComplexityFilter(
        playerComplexities.slice(0, playerCount),
        availableComplexities,
      ),
    )

    if (!selection) {
      setResults(null)
      setError(
        'These complexity choices cannot give every player a different spirit. Enable more complexity levels or allow more levels for each player.',
      )
      return
    }

    setResults(
      selection.map((spirit, index) => ({
        playerNumber: index + 1,
        spirit,
        selectedAspectId: null,
      })),
    )
    setError(null)
  }

  function chooseAspect(spiritId: string, aspectId: string | null) {
    setResults((current) => {
      if (!current) {
        return null
      }

      return current.map((result) =>
        result.spirit.id === spiritId
          ? { ...result, selectedAspectId: aspectId }
          : result,
      )
    })
  }

  function rerollPlayer(playerNumber: number) {
    if (!results) {
      return
    }

    const playerIndex = playerNumber - 1
    const availableForPlayer =
      applyGlobalComplexityFilter(
        [playerComplexities[playerIndex] ?? []],
        availableComplexities,
      )[0] ?? []
    const replacement = rerollSpirit(
      spirits,
      availableForPlayer,
      new Set(results.map((result) => result.spirit.id)),
    )

    if (!replacement) {
      setError(
        `No different eligible spirit is available for Player ${playerNumber} without changing anyone else's spirit. Adjust the complexity choices or pick spirits again for everyone.`,
      )
      return
    }

    setResults(
      results.map((result) =>
        result.playerNumber === playerNumber
          ? {
              ...result,
              spirit: replacement,
              selectedAspectId: null,
            }
          : result,
      ),
    )
    setError(null)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#101814] text-[#f2f4ed]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-48 size-[28rem] rounded-full bg-emerald-900/20 blur-3xl" />
        <div className="absolute -bottom-56 -right-32 size-[32rem] rounded-full bg-[#536b48]/10 blur-3xl" />
      </div>

      <main className="relative mx-auto flex w-full max-w-5xl flex-col gap-7 px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
        <h1 className="text-3xl font-semibold tracking-tight text-[#f2f4ed] sm:text-4xl">
          Spirit Island Helper
        </h1>
        <AdversarySelector onSelectionChange={changeAdversary} />

        <section
          aria-labelledby="setup-title"
          className="rounded-2xl border border-white/10 bg-[#17211b]/90 p-5 shadow-2xl shadow-black/10 sm:p-7"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="setup-title" className="text-lg font-semibold">
                Game setup
              </h2>
            </div>
            <label className="flex items-center gap-3 text-sm font-medium text-[#d9e1d5]">
              <span>Players</span>
              <select
                className="min-h-11 rounded-lg border border-white/15 bg-[#101814] px-3 text-base text-white focus-visible:outline-emerald-300"
                value={playerCount}
                onChange={(event) => changePlayerCount(Number(event.target.value))}
              >
                {playerOptions.map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="mt-6 rounded-xl border border-emerald-100/10 bg-[#101814]/50 p-4 sm:p-5">
            <legend className="px-1 text-sm font-semibold text-[#e2e8de]">
              Complexities available to everyone
            </legend>
            <p className="mb-3 text-sm text-[#aeb9ad]">
              Turn a level off here to exclude it for every player.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {complexities.map((complexity) => {
                const inputId = `all-players-${complexity
                  .toLowerCase()
                  .replace(' ', '-')}`

                return (
                  <label
                    key={complexity}
                    htmlFor={inputId}
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-white/5 px-2.5 text-sm text-[#c5cec2] transition hover:border-emerald-200/20 hover:bg-white/5"
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={availableComplexities.includes(complexity)}
                      onChange={() => toggleAvailableComplexity(complexity)}
                      className="size-4 accent-emerald-400"
                    />
                    {complexity}
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {playerComplexities.slice(0, playerCount).map((selected, index) => (
              <fieldset
                key={index}
                className="rounded-xl border border-white/10 bg-[#101814]/70 p-4"
              >
                <legend className="px-1 text-sm font-semibold text-[#e2e8de]">
                  Player {index + 1}
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {complexities.map((complexity) => {
                    const inputId = `player-${index + 1}-${complexity
                      .toLowerCase()
                      .replace(' ', '-')}`

                    return (
                      <label
                        key={complexity}
                        htmlFor={inputId}
                        className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-white/5 px-2.5 text-sm text-[#c5cec2] transition hover:border-emerald-200/20 hover:bg-white/5"
                      >
                        <input
                          id={inputId}
                          type="checkbox"
                          checked={selected.includes(complexity)}
                          disabled={!availableComplexities.includes(complexity)}
                          onChange={() => toggleComplexity(index, complexity)}
                          className="size-4 accent-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                        />
                        <span
                          className={
                            availableComplexities.includes(complexity)
                              ? ''
                              : 'opacity-50'
                          }
                        >
                          {complexity}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <button
            type="button"
            onClick={generateSelection}
            disabled={!selectedAdversary}
            className="mt-6 min-h-12 w-full rounded-xl bg-emerald-300 px-5 py-3 text-sm font-bold text-[#102016] transition hover:bg-emerald-200 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Pick spirits
          </button>
          {!selectedAdversary && (
            <p className="mt-3 text-sm text-[#aeb9ad]">
              Pick an adversary above to unlock spirit selection.
            </p>
          )}
        </section>

        <div aria-live="polite" className="mt-7">
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-amber-200/20 bg-amber-950/30 px-4 py-3 text-sm leading-6 text-amber-100"
            >
              {error}
            </p>
          )}

          {results && (
            <section aria-labelledby="results-title">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 id="results-title" className="text-xl font-semibold">
                  Your spirits
                </h2>
                <p className="text-sm text-[#aeb9ad]">
                  Matchup tier vs. {selectedAdversary?.name}
                </p>
              </div>
              <p className="mb-4 text-sm leading-6 text-[#aeb9ad]">
                Tiers are for level 6 adversaries in 4+ spirit games without
                outside support. An asterisk marks a matchup that may be harder
                to achieve at its listed tier.{' '}
                <a
                  href="https://www.reddit.com/r/spiritisland/comments/1bqer7k/reds_matchup_axis_5_star_system/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-200 underline decoration-emerald-200/40 underline-offset-2 hover:text-emerald-100"
                >
                  Source and rating guide
                </a>
              </p>
              <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.map(
                  ({ playerNumber, spirit, selectedAspectId }) => {
                    const selectedAspect = spirit.aspects.find(
                      (aspect) => aspect.id === selectedAspectId,
                    )
                    const matchupTier = getMatchupTier(
                      selectedAspect?.id ?? spirit.id,
                      selectedAdversary?.id ?? '',
                    )

                    return (
                      <li
                        key={spirit.id}
                        className="rounded-xl border border-emerald-100/10 bg-[#17211b]/90 p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
                            Player {playerNumber}
                          </p>
                          <button
                            type="button"
                            onClick={() => rerollPlayer(playerNumber)}
                            aria-label={`Reroll spirit for Player ${playerNumber}`}
                            className="min-h-9 rounded-lg border border-emerald-200/20 px-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-200/40 hover:bg-emerald-200/10 focus-visible:outline-emerald-300"
                          >
                            Reroll
                          </button>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold leading-snug text-[#f2f4ed]">
                          {spirit.name}
                        </h3>
                        <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#b8c2b7]">
                          <div className="flex gap-1.5">
                            <dt className="text-[#829084]">Complexity</dt>
                            <dd>{spirit.complexity}</dd>
                          </div>
                          {matchupTier && (
                            <div className="flex gap-1.5">
                              <dt className="text-[#829084]">Matchup tier</dt>
                              <dd aria-label={`Tier ${matchupTier}`}>
                                {matchupTier}
                              </dd>
                            </div>
                          )}
                        </dl>
                        {spirit.aspects.length > 0 && (
                          <div className="mt-5">
                            <label
                              htmlFor={`aspect-${spirit.id}`}
                              className="mb-2 block text-sm font-medium text-[#d9e1d5]"
                            >
                              Aspect (optional)
                            </label>
                            <select
                              id={`aspect-${spirit.id}`}
                              value={selectedAspectId ?? ''}
                              onChange={(event) =>
                                chooseAspect(
                                  spirit.id,
                                  event.target.value || null,
                                )
                              }
                              className="min-h-11 w-full rounded-lg border border-white/15 bg-[#101814] px-3 text-base text-white focus-visible:outline-emerald-300"
                            >
                              <option value="">
                                Base spirit — Tier{' '}
                                {getMatchupTier(
                                  spirit.id,
                                  selectedAdversary?.id ?? '',
                                ) ?? 'unavailable'}
                              </option>
                              {spirit.aspects.map((aspect) => (
                                <option key={aspect.id} value={aspect.id}>
                                  {aspect.name} — Tier{' '}
                                  {getMatchupTier(
                                    aspect.id,
                                    selectedAdversary?.id ?? '',
                                  ) ?? 'unavailable'}
                                </option>
                              ))}
                            </select>
                            {selectedAspect && (
                              <p className="mt-2 text-sm text-[#aeb9ad]">
                                {complexityModifierLabels[
                                  selectedAspect.complexityModifier
                                ]}
                              </p>
                            )}
                          </div>
                        )}
                      </li>
                    )
                  },
                )}
              </ol>
            </section>
          )}
        </div>

      </main>
    </div>
  )
}

export default App
