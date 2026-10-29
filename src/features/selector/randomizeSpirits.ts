import type { Spirit, SpiritComplexity } from '../../types/spirit'

export function randomizeSpirits(
  spirits: readonly Spirit[],
  playerComplexities: readonly (readonly SpiritComplexity[])[],
  random: () => number = Math.random,
): readonly Spirit[] | null {
  const candidates = playerComplexities.map((complexities) =>
    shuffle(
      spirits.filter((spirit) => complexities.includes(spirit.complexity)),
      random,
    ),
  )

  if (candidates.some((playerCandidates) => playerCandidates.length === 0)) {
    return null
  }

  const playerOrder = shuffle(
    playerComplexities.map((_, index) => index),
    random,
  )
  const assignments: (Spirit | undefined)[] = Array.from({
    length: playerComplexities.length,
  })
  const usedSpiritIds = new Set<string>()

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
