import type { Adversary } from '../../types/adversary'

export function sortAdversariesByLevel6Difficulty(
  adversaries: readonly Adversary[],
): readonly Adversary[] {
  return [...adversaries].sort(
    (first, second) =>
      first.level6Difficulty - second.level6Difficulty ||
      first.name.localeCompare(second.name),
  )
}

export function randomizeAdversary(
  adversaries: readonly Adversary[],
  excludedAdversaryIds: ReadonlySet<string>,
  random: () => number = Math.random,
): Adversary | null {
  const eligibleAdversaries = adversaries.filter(
    (adversary) => !excludedAdversaryIds.has(adversary.id),
  )

  if (eligibleAdversaries.length === 0) {
    return null
  }

  const randomIndex = Math.floor(random() * eligibleAdversaries.length)
  return eligibleAdversaries[randomIndex] ?? null
}
