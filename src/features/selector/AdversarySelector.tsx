import { useState } from 'react'
import { adversaries } from '../../data/adversaries'
import type { Adversary } from '../../types/adversary'
import {
  randomizeAdversary,
  sortAdversariesByLevel6Difficulty,
} from './randomizeAdversary'

const sortedAdversaries = sortAdversariesByLevel6Difficulty(adversaries)

type AdversarySelectorProps = {
  readonly onSelectionChange: (adversary: Adversary | null) => void
}

function AdversarySelector({
  onSelectionChange,
}: AdversarySelectorProps) {
  const [excludedAdversaryIds, setExcludedAdversaryIds] = useState<
    ReadonlySet<string>
  >(new Set())
  const [selectedAdversary, setSelectedAdversary] =
    useState<(typeof adversaries)[number] | null>(null)
  const [error, setError] = useState<string | null>(null)

  function setAllIncluded(included: boolean) {
    setExcludedAdversaryIds(
      included ? new Set() : new Set(adversaries.map((adversary) => adversary.id)),
    )
    setSelectedAdversary(null)
    onSelectionChange(null)
    setError(null)
  }

  function toggleAdversary(adversaryId: string) {
    setExcludedAdversaryIds((current) => {
      const updated = new Set(current)

      if (updated.has(adversaryId)) {
        updated.delete(adversaryId)
      } else {
        updated.add(adversaryId)
      }

      return updated
    })
    setSelectedAdversary(null)
    onSelectionChange(null)
    setError(null)
  }

  function generateAdversary() {
    const adversary = randomizeAdversary(adversaries, excludedAdversaryIds)

    if (!adversary) {
      setSelectedAdversary(null)
      setError('All adversaries are excluded. Include at least one.')
      return
    }

    setSelectedAdversary(adversary)
    onSelectionChange(adversary)
    setError(null)
  }

  return (
    <section
      aria-labelledby="adversary-title"
      className="rounded-2xl border border-white/10 bg-[#17211b]/90 p-5 shadow-2xl shadow-black/10 sm:p-7"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="adversary-title" className="text-xl font-semibold">
            Random adversary
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setAllIncluded(excludedAdversaryIds.size > 0)}
          className="min-h-9 self-start rounded-lg border border-white/10 px-3 text-xs font-medium text-[#c5cec2] transition hover:border-emerald-200/30 hover:text-emerald-100 focus-visible:outline-emerald-300 sm:self-auto"
        >
          {excludedAdversaryIds.size === 0 ? 'Unselect all' : 'Select all'}
        </button>
      </div>

      <fieldset className="mt-5">
        <legend className="sr-only">
          Include adversaries in the random selection
        </legend>
        <ul className="grid gap-2 sm:grid-cols-2">
          {sortedAdversaries.map((adversary) => {
            const isIncluded = !excludedAdversaryIds.has(adversary.id)
            const checkboxId = `adversary-${adversary.id}`

            return (
              <li key={adversary.id}>
                <label
                  htmlFor={checkboxId}
                  className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#101814]/70 px-4 py-3 transition hover:border-emerald-200/20 hover:bg-white/5"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <input
                      id={checkboxId}
                      type="checkbox"
                      checked={isIncluded}
                      onChange={() => toggleAdversary(adversary.id)}
                      className="size-4 shrink-0 accent-emerald-400"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[#e2e8de]">
                        {adversary.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-[#95a294]">
                        {adversary.expansion}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full border border-emerald-200/15 px-2.5 py-1 text-xs text-emerald-100">
                    Difficulty {adversary.level6Difficulty}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </fieldset>

      <button
        type="button"
        onClick={generateAdversary}
        className="mt-5 min-h-12 w-full rounded-xl border border-emerald-200/20 bg-emerald-950/60 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-900/70 focus-visible:outline-offset-4 sm:w-auto"
      >
        Pick an adversary
      </button>

      <div aria-live="polite" className="mt-4">
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-amber-200/20 bg-amber-950/30 px-4 py-3 text-sm leading-6 text-amber-100"
          >
            {error}
          </p>
        )}

        {selectedAdversary && (
          <article
            aria-labelledby="selected-adversary-name"
            className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200/15 bg-[#101814]/70 p-5 text-center sm:flex-row sm:justify-between sm:text-left"
          >
            <div>
              <h3
                id="selected-adversary-name"
                className="text-xl font-semibold text-[#f2f4ed]"
              >
                {selectedAdversary.name}
              </h3>
              <p className="mt-1 text-sm text-[#b8c2b7]">
                {selectedAdversary.expansion}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-emerald-200/15 px-2.5 py-1 text-xs text-emerald-100">
              Difficulty {selectedAdversary.level6Difficulty}
            </span>
          </article>
        )}
      </div>
    </section>
  )
}

export default AdversarySelector
