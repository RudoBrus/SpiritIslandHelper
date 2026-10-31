import { useState, type DragEvent } from 'react'
import {
  defaultTierPlacements,
  readTierPlacements,
  tierListItems,
  tierNames,
  type TierName,
  type TierPlacements,
} from './tierListData'

const storageKey = 'spirit-island-helper-general-tier-list-v2'

const tierColors: Record<TierName, string> = {
  X: 'border-violet-300/30 bg-violet-500/80 text-white',
  S: 'border-sky-300/30 bg-sky-400/80 text-[#101814]',
  A: 'border-cyan-300/30 bg-cyan-400/80 text-[#101814]',
  B: 'border-emerald-300/30 bg-emerald-400/80 text-[#101814]',
  C: 'border-yellow-300/30 bg-yellow-300/90 text-[#101814]',
  D: 'border-orange-300/30 bg-orange-400/90 text-[#101814]',
  F: 'border-rose-300/30 bg-rose-400/90 text-[#101814]',
}

function GeneralTierList() {
  const [initialPlacements] = useState(() => {
    try {
      const savedValue = window.localStorage.getItem(storageKey)
      const placements = readTierPlacements(savedValue)

      return {
        placements: placements ?? defaultTierPlacements,
        message:
          savedValue && !placements
            ? 'Could not load the saved tier list because its data is invalid.'
            : null,
      }
    } catch (error) {
      return {
        placements: defaultTierPlacements,
        message: `Could not load the saved tier list: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }
    }
  })
  const [itemsByTier, setItemsByTier] = useState<TierPlacements>(
    initialPlacements.placements,
  )
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [storageMessage, setStorageMessage] = useState<string | null>(
    initialPlacements.message,
  )
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)

  function savePlacements(placements: TierPlacements) {
    setItemsByTier(placements)

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(placements))
      setStorageMessage(null)
    } catch (error) {
      setStorageMessage(
        `Could not save the tier list in this browser: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
  }

  function moveItem(
    itemId: string,
    tier: TierName,
    beforeItemId?: string,
  ) {
    if (!tierListItems.some((item) => item.id === itemId)) {
      return
    }

    const placements = Object.fromEntries(
      tierNames.map((name) => [
        name,
        itemsByTier[name].filter((currentItemId) => currentItemId !== itemId),
      ]),
    ) as TierPlacements
    const destination = placements[tier]
    const insertIndex = beforeItemId
      ? destination.indexOf(beforeItemId)
      : -1

    if (insertIndex === -1) {
      destination.push(itemId)
    } else {
      destination.splice(insertIndex, 0, itemId)
    }

    savePlacements(placements)
    setSelectedItemId(null)
    setDraggedItemId(null)
  }

  function handleDrop(
    event: DragEvent,
    tier: TierName,
    beforeItemId?: string,
  ) {
    event.preventDefault()
    event.stopPropagation()
    const itemId = event.dataTransfer.getData('text/plain')

    if (itemId) {
      moveItem(itemId, tier, beforeItemId)
    }
  }

  function moveWithKeyboard(itemId: string, currentTier: TierName, offset: number) {
    const currentIndex = tierNames.indexOf(currentTier)
    const nextTier = tierNames[currentIndex + offset]

    if (nextTier) {
      moveItem(itemId, nextTier)
    }
  }

  function reorderWithinTier(itemId: string, tier: TierName, offset: number) {
    const items = [...itemsByTier[tier]]
    const currentIndex = items.indexOf(itemId)
    const nextIndex = currentIndex + offset

    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= items.length) {
      return
    }

    items.splice(currentIndex, 1)
    items.splice(nextIndex, 0, itemId)
    savePlacements({ ...itemsByTier, [tier]: items })
  }

  return (
    <section
      aria-labelledby="general-tier-list-title"
      className="rounded-2xl border border-white/10 bg-[#17211b]/90 p-5 shadow-2xl shadow-black/10 sm:p-7"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="general-tier-list-title" className="text-xl font-semibold">
            General spirit tier list
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            savePlacements(defaultTierPlacements)
            setSelectedItemId(null)
          }}
          className="min-h-9 shrink-0 self-start rounded-lg border border-white/10 px-3 text-xs font-medium text-[#c5cec2] transition hover:border-emerald-200/30 hover:text-emerald-100 focus-visible:outline-emerald-300 sm:self-auto"
        >
          Reset tiers
        </button>
      </div>

      {storageMessage && (
        <p
          className="mt-4 rounded-lg border border-amber-200/20 bg-amber-950/30 px-3 py-2 text-sm text-amber-100"
          role="status"
        >
          {storageMessage}
        </p>
      )}
      {selectedItemId && (
        <p className="mt-4 text-sm text-emerald-100" aria-live="polite">
          Tile selected. Tap a tier to move it.
        </p>
      )}

      <div className="mt-5 space-y-2">
        {tierNames.map((tier) => {
          const items = itemsByTier[tier].flatMap((itemId) => {
            const item = tierListItems.find(
              (candidate) => candidate.id === itemId,
            )

            return item ? [item] : []
          })

          return (
            <section
              key={tier}
              aria-label={`${tier} tier`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, tier)}
              onClick={() => {
                if (selectedItemId) {
                  moveItem(selectedItemId, tier)
                }
              }}
              className={`grid grid-cols-[3.5rem_minmax(0,1fr)] overflow-hidden rounded-lg border border-white/10 bg-[#101814]/80 ${
                selectedItemId ? 'cursor-pointer' : ''
              }`}
            >
              <h3
                className={`flex items-center justify-center px-1 text-lg font-bold ${tierColors[tier]}`}
              >
                {tier}
              </h3>
              <ul className="flex min-w-0 flex-wrap content-start gap-1.5 p-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      draggable
                      aria-pressed={selectedItemId === item.id}
                      aria-label={`${item.name}, ${tier} tier. Drag to move or reorder; arrow keys move between tiers and reorder within a tier.`}
                      aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
                      title={`${item.name} — ${tier} tier`}
                      onClick={(event) => {
                        event.stopPropagation()

                        if (selectedItemId && selectedItemId !== item.id) {
                          const selectedTier = tierNames.find((name) =>
                            itemsByTier[name].includes(selectedItemId),
                          )
                          moveItem(
                            selectedItemId,
                            tier,
                            selectedTier === tier ? item.id : undefined,
                          )
                        } else {
                          setSelectedItemId((current) =>
                            current === item.id ? null : item.id,
                          )
                        }
                      }}
                      onDragStart={(event) => {
                        event.dataTransfer.setData('text/plain', item.id)
                        event.dataTransfer.effectAllowed = 'move'
                        setDraggedItemId(item.id)
                        setSelectedItemId(null)
                      }}
                      onDragEnd={() => setDraggedItemId(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => handleDrop(event, tier, item.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'ArrowUp') {
                          event.preventDefault()
                          moveWithKeyboard(item.id, tier, -1)
                        } else if (event.key === 'ArrowDown') {
                          event.preventDefault()
                          moveWithKeyboard(item.id, tier, 1)
                        } else if (event.key === 'ArrowLeft') {
                          event.preventDefault()
                          reorderWithinTier(item.id, tier, -1)
                        } else if (event.key === 'ArrowRight') {
                          event.preventDefault()
                          reorderWithinTier(item.id, tier, 1)
                        }
                      }}
                      className={`group relative block w-[5.25rem] overflow-hidden rounded border bg-[#202b24] text-left transition hover:z-10 hover:border-emerald-200/60 focus-visible:z-10 focus-visible:outline-emerald-300 ${
                        selectedItemId === item.id
                          ? 'border-emerald-200 ring-2 ring-emerald-300'
                          : 'border-white/10'
                      } ${draggedItemId === item.id ? 'opacity-40' : ''}`}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        width={300}
                        height={194}
                        draggable={false}
                        className="aspect-[300/194] w-full object-cover"
                      />
                    </button>
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="flex min-h-24 flex-1 items-center justify-center text-xs text-[#829084]">
                    Drop tiles here
                  </li>
                )}
              </ul>
            </section>
          )
        })}
      </div>
    </section>
  )
}

export default GeneralTierList
