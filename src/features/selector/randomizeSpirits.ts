import type { Spirit, SpiritComplexity } from '../../types/spirit'
import { getMatchupTier } from '../../data/matchups'

export function applyGlobalComplexityFilter(
  playerComplexities: readonly (readonly SpiritComplexity[])[],
  availableComplexities: readonly SpiritComplexity[],
): readonly (readonly SpiritComplexity[])[] {
  return playerComplexities.map((complexities) =>
    complexities.filter((complexity) =>
      availableComplexities.includes(complexity),
    ),
  )
}

export function excludeFMatchups(
  spirits: readonly Spirit[],
  adversaryId: string | null,
): readonly Spirit[] {
  if (!adversaryId) {
    return spirits
  }

  return spirits.filter(
    (spirit) => !getMatchupTier(spirit.id, adversaryId)?.startsWith('F'),
  )
}

export function randomizeSpirits(
  spirits: readonly Spirit[],
  playerComplexities: readonly (readonly SpiritComplexity[])[],
  random: () => number = Math.random,
): readonly Spirit[] | null {
  return randomizeSpiritsWithFixedChoices(
    spirits,
    playerComplexities,
    [],
    random,
  )
}

export function randomizeSpiritsWithFixedChoices(
  spirits: readonly Spirit[],
  playerComplexities: readonly (readonly SpiritComplexity[])[],
  fixedSpirits: readonly (Spirit | null)[],
  random: () => number = Math.random,
): readonly Spirit[] | null {
  const assignments: (Spirit | undefined)[] = Array.from({
    length: playerComplexities.length,
  })
  const usedSpiritIds = new Set<string>()
  const randomPlayerIndices: number[] = []

  for (let index = 0; index < playerComplexities.length; index += 1) {
    const fixedSpirit = fixedSpirits[index]

    if (fixedSpirit == null) {
      randomPlayerIndices.push(index)
      continue
    }

    if (usedSpiritIds.has(fixedSpirit.id)) {
      return null
    }

    assignments[index] = fixedSpirit
    usedSpiritIds.add(fixedSpirit.id)
  }

  const candidates = playerComplexities.map((complexities) =>
    shuffle(
      spirits.filter((spirit) => complexities.includes(spirit.complexity)),
      random,
    ),
  )

  if (
    randomPlayerIndices.some(
      (playerIndex) =>
        !candidates[playerIndex]!.some(
          (spirit) => !usedSpiritIds.has(spirit.id),
        ),
    )
  ) {
    return null
  }

  const playerOrder = shuffle(randomPlayerIndices, random)

  function assignPlayers(remainingPlayers: readonly number[]): boolean {
    if (remainingPlayers.length === 0) {
      return true
    }

    let selectedPlayerIndex = -1
    let availableSpirits: Spirit[] = []

    for (const playerIndex of remainingPlayers) {
      const available = candidates[playerIndex]!.filter(
        (spirit) => !usedSpiritIds.has(spirit.id),
      )

      if (
        selectedPlayerIndex === -1 ||
        available.length < availableSpirits.length
      ) {
        selectedPlayerIndex = playerIndex
        availableSpirits = available
      }
    }

    if (availableSpirits.length === 0) {
      return false
    }

    const nextPlayers = remainingPlayers.filter(
      (playerIndex) => playerIndex !== selectedPlayerIndex,
    )

    for (const spirit of availableSpirits) {
      assignments[selectedPlayerIndex] = spirit
      usedSpiritIds.add(spirit.id)

      if (assignPlayers(nextPlayers)) {
        return true
      }

      usedSpiritIds.delete(spirit.id)
      assignments[selectedPlayerIndex] = undefined
    }

    return false
  }

  if (!assignPlayers(playerOrder)) {
    return null
  }

  return assignments.map((spirit) => {
    if (!spirit) {
      throw new Error('Spirit assignment was incomplete.')
    }

    return spirit
  })
}

export function rerollSpirit(
  spirits: readonly Spirit[],
  playerComplexities: readonly SpiritComplexity[],
  excludedSpiritIds: ReadonlySet<string>,
  random: () => number = Math.random,
): Spirit | null {
  const candidates = shuffle(
    spirits.filter(
      (spirit) =>
        playerComplexities.includes(spirit.complexity) &&
        !excludedSpiritIds.has(spirit.id),
    ),
    random,
  )

  return candidates[0] ?? null
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex]!,
      shuffled[index]!,
    ]
  }

  return shuffled
}
