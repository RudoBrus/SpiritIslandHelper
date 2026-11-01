export type PlayerProfile = {
  readonly id: string
  readonly name: string
}

export type SavedGamePlayer = {
  readonly profileId: string
  readonly profileName: string
  readonly spiritId: string
  readonly spiritName: string
  readonly aspectName: string | null
}

export type SavedGame = {
  readonly id: string
  readonly playedAt: string
  readonly outcome: 'won' | 'lost'
  readonly adversaryId: string
  readonly adversaryName: string
  readonly players: readonly SavedGamePlayer[]
}

export type ProfileHistoryData = {
  readonly profiles: readonly PlayerProfile[]
  readonly games: readonly SavedGame[]
}

export const emptyProfileHistory: ProfileHistoryData = {
  profiles: [],
  games: [],
}

export function getRecentlyPlayedSpiritIds(
  games: readonly SavedGame[],
  profileId: string,
  gameLimit: number,
): ReadonlySet<string> {
  const recentGames = [...games]
    .filter((game) =>
      game.players.some((player) => player.profileId === profileId),
    )
    .sort((first, second) =>
      second.playedAt.localeCompare(first.playedAt),
    )
    .slice(0, gameLimit)

  return new Set(
    recentGames.flatMap((game) =>
      game.players
        .filter((player) => player.profileId === profileId)
        .map((player) => player.spiritId),
    ),
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isProfile(value: unknown): value is PlayerProfile {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string'
  )
}

function isSavedGamePlayer(value: unknown): value is SavedGamePlayer {
  return (
    isRecord(value) &&
    typeof value.profileId === 'string' &&
    typeof value.profileName === 'string' &&
    typeof value.spiritId === 'string' &&
    typeof value.spiritName === 'string' &&
    (typeof value.aspectName === 'string' || value.aspectName === null)
  )
}

function isSavedGame(value: unknown): value is SavedGame {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.playedAt === 'string' &&
    (value.outcome === 'won' || value.outcome === 'lost') &&
    typeof value.adversaryId === 'string' &&
    typeof value.adversaryName === 'string' &&
    Array.isArray(value.players) &&
    value.players.every(isSavedGamePlayer)
  )
}

export function readProfileHistory(value: string | null): ProfileHistoryData | null {
  if (value === null) {
    return emptyProfileHistory
  }

  const parsed: unknown = JSON.parse(value)

  if (
    !isRecord(parsed) ||
    parsed.version !== 1 ||
    !Array.isArray(parsed.profiles) ||
    !parsed.profiles.every(isProfile) ||
    !Array.isArray(parsed.games) ||
    !parsed.games.every(isSavedGame)
  ) {
    return null
  }

  return {
    profiles: parsed.profiles,
    games: parsed.games,
  }
}
