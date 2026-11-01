import { useState, type FormEvent } from 'react'
import type { Adversary } from './types/adversary'
import { adversaries } from './data/adversaries'
import { getMatchupTier } from './data/matchups'
import { spirits } from './data/spirits'
import AdversarySelector from './features/selector/AdversarySelector'
import {
  applyGlobalComplexityFilter,
  excludeFMatchups,
  rerollSpirit,
  randomizeSpiritsWithFixedChoices,
} from './features/selector/randomizeSpirits'
import MatchupAxis from './features/matchups/MatchupAxis'
import { matchupTierColors } from './features/matchups/matchupTierStyles'
import GeneralTierList from './features/tierList/GeneralTierList'
import { tierListItems } from './features/tierList/tierListData'
import {
  emptyProfileHistory,
  getRecentlyPlayedSpiritIds,
  readProfileHistory,
  type ProfileHistoryData,
  type SavedGame,
  type SavedGamePlayer,
  type SpiritWeight,
} from './features/profiles/profileHistory'
import type { SpiritComplexity } from './types/spirit'

const complexities: readonly SpiritComplexity[] = [
  'Low',
  'Moderate',
  'High',
  'Very High',
]

const playerOptions = Array.from({ length: 6 }, (_, index) => index + 1)
const tierListItemsById = new Map(
  tierListItems.map((item) => [item.id, item]),
)
const sortedSpirits = [...spirits].sort((first, second) =>
  first.name.localeCompare(second.name),
)
const profileHistoryStorageKey = 'spirit-island-helper-profile-history-v1'
const recentGamesToExclude = 3
const spiritWeightOptions: readonly {
  readonly value: SpiritWeight
  readonly label: string
}[] = [
  { value: 0, label: 'Never (0×)' },
  { value: 0.5, label: 'Less often (½×)' },
  { value: 1, label: 'Normal (1×)' },
  { value: 2, label: 'More often (2×)' },
  { value: 4, label: 'Much more often (4×)' },
]

function App() {
  const [activeView, setActiveView] = useState<
    'picker' | 'axis' | 'general-tier-list' | 'profiles'
  >('picker')
  const [playerCount, setPlayerCount] = useState(2)
  const [availableComplexities, setAvailableComplexities] =
    useState<readonly SpiritComplexity[]>(complexities)
  const [playerComplexities, setPlayerComplexities] = useState<
    readonly (readonly SpiritComplexity[])[]
  >([complexities, complexities])
  const [playerSpiritChoices, setPlayerSpiritChoices] = useState<
    readonly (string | null)[]
  >([null, null])
  const [playerProfileChoices, setPlayerProfileChoices] = useState<
    readonly (string | null)[]
  >([null, null])
  const [profileName, setProfileName] = useState('')
  const [profileSpiritSearch, setProfileSpiritSearch] = useState<
    Readonly<Record<string, string>>
  >({})
  const [profileHistoryState, setProfileHistoryState] = useState<{
    readonly data: ProfileHistoryData
    readonly error: string | null
  }>(() => {
    try {
      const saved = readProfileHistory(
        window.localStorage.getItem(profileHistoryStorageKey),
      )

      return saved
        ? { data: saved, error: null }
        : {
            data: emptyProfileHistory,
            error: 'Could not load saved profiles because their data is invalid.',
          }
    } catch (loadError) {
      return {
        data: emptyProfileHistory,
        error: `Could not load saved profiles: ${
          loadError instanceof Error ? loadError.message : String(loadError)
        }`,
      }
    }
  })
  const [profileHistoryMessage, setProfileHistoryMessage] = useState<
    string | null
  >(null)
  const [editingGame, setEditingGame] = useState<SavedGame | null>(null)
  const [selectedAdversary, setSelectedAdversary] =
    useState<Adversary | null>(null)
  const [showMatchupTiers, setShowMatchupTiers] = useState(false)
  const [results, setResults] = useState<
    | readonly {
        playerNumber: number
        spirit: (typeof spirits)[number]
        selectedAspectId: string | null
      }[]
    | null
  >(null)
  const [error, setError] = useState<string | null>(null)

  function persistProfileHistory(data: ProfileHistoryData) {
    try {
      window.localStorage.setItem(
        profileHistoryStorageKey,
        JSON.stringify({ version: 1, ...data }),
      )
      setProfileHistoryState({ data, error: null })
      setProfileHistoryMessage(null)
      return true
    } catch (saveError) {
      setProfileHistoryMessage(
        `Could not save profiles or game history: ${
          saveError instanceof Error ? saveError.message : String(saveError)
        }`,
      )
      return false
    }
  }

  function addProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = profileName.trim()

    if (!name) {
      setProfileHistoryMessage('Enter a profile name.')
      return
    }

    if (
      profileHistoryState.data.profiles.some(
        (profile) => profile.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
      )
    ) {
      setProfileHistoryMessage('A profile with that name already exists.')
      return
    }

    const profile = {
      id: crypto.randomUUID(),
      name,
      spiritWeights: {},
    }

    if (
      persistProfileHistory({
        ...profileHistoryState.data,
        profiles: [...profileHistoryState.data.profiles, profile],
      })
    ) {
      setProfileName('')
    }
  }

  function removeProfile(profileId: string) {
    persistProfileHistory({
      ...profileHistoryState.data,
      profiles: profileHistoryState.data.profiles.filter(
        (profile) => profile.id !== profileId,
      ),
    })
    setPlayerProfileChoices((current) =>
      current.map((choice) => (choice === profileId ? null : choice)),
    )
  }

  function updateProfileSpiritWeight(
    profileId: string,
    spiritId: string,
    weight: SpiritWeight,
  ) {
    const profile = profileHistoryState.data.profiles.find(
      (candidate) => candidate.id === profileId,
    )
    if (!profile) {
      return
    }

    const spiritWeights = { ...profile.spiritWeights }
    if (weight === 1) {
      delete spiritWeights[spiritId]
    } else {
      spiritWeights[spiritId] = weight
    }

    persistProfileHistory({
      ...profileHistoryState.data,
      profiles: profileHistoryState.data.profiles.map((candidate) =>
        candidate.id === profileId
          ? { ...candidate, spiritWeights }
          : candidate,
      ),
    })
  }

  function choosePlayerProfile(playerIndex: number, profileId: string) {
    setPlayerProfileChoices((current) =>
      Array.from({ length: playerCount }, (_, index) =>
        index === playerIndex ? profileId || null : current[index] ?? null,
      ),
    )
  }

  function saveGame(outcome: SavedGame['outcome']) {
    if (!selectedAdversary || !results) {
      return
    }

    const players = results.map((result) => {
      const profileId = playerProfileChoices[result.playerNumber - 1]
      const profile = profileHistoryState.data.profiles.find(
        (candidate) => candidate.id === profileId,
      )
      const aspect = result.spirit.aspects.find(
        (candidate) => candidate.id === result.selectedAspectId,
      )

      return profile
        ? {
            profileId: profile.id,
            profileName: profile.name,
            spiritId: result.spirit.id,
            spiritName: result.spirit.name,
            aspectName: aspect?.name ?? null,
          }
        : null
    })

    const savedPlayers = players.filter(
      (player): player is SavedGamePlayer => player !== null,
    )

    if (savedPlayers.length !== results.length) {
      setProfileHistoryMessage(
        'Choose a profile for each player before saving this game.',
      )
      return
    }

    if (new Set(savedPlayers.map((player) => player.profileId)).size !== savedPlayers.length) {
      setProfileHistoryMessage(
        'Choose a different profile for each player in this game.',
      )
      return
    }

    const game: SavedGame = {
      id: crypto.randomUUID(),
      playedAt: new Date().toISOString(),
      outcome,
      adversaryId: selectedAdversary.id,
      adversaryName: selectedAdversary.name,
      players: savedPlayers,
    }

    if (
      persistProfileHistory({
        ...profileHistoryState.data,
        games: [game, ...profileHistoryState.data.games],
      })
    ) {
      setProfileHistoryMessage('Game saved.')
    }
  }

  function startEditingGame(game: SavedGame) {
    setEditingGame({
      ...game,
      players: game.players.map((player) => ({ ...player })),
    })
    setProfileHistoryMessage(null)
  }

  function updateEditingGamePlayer(
    playerIndex: number,
    updates: Partial<SavedGamePlayer>,
  ) {
    setEditingGame((current) =>
      current
        ? {
            ...current,
            players: current.players.map((player, index) =>
              index === playerIndex ? { ...player, ...updates } : player,
            ),
          }
        : null,
    )
  }

  function saveEditedGame() {
    if (!editingGame) {
      return
    }

    if (
      new Set(editingGame.players.map((player) => player.profileId)).size !==
      editingGame.players.length
    ) {
      setProfileHistoryMessage(
        'Choose a different profile for each player in this game.',
      )
      return
    }

    if (
      persistProfileHistory({
        ...profileHistoryState.data,
        games: profileHistoryState.data.games.map((game) =>
          game.id === editingGame.id ? editingGame : game,
        ),
      })
    ) {
      setEditingGame(null)
      setProfileHistoryMessage('Game updated.')
    }
  }

  function removeSavedGame(game: SavedGame) {
    if (
      !window.confirm(
        `Remove the saved game against ${game.adversaryName}?`,
      )
    ) {
      return
    }

    if (
      persistProfileHistory({
        ...profileHistoryState.data,
        games: profileHistoryState.data.games.filter(
          (savedGame) => savedGame.id !== game.id,
        ),
      })
    ) {
      if (editingGame?.id === game.id) {
        setEditingGame(null)
      }
      setProfileHistoryMessage('Game removed.')
    }
  }

  function changeAdversary(adversary: Adversary | null) {
    setSelectedAdversary(adversary)
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
    setPlayerSpiritChoices((current) =>
      Array.from({ length: count }, (_, index) => current[index] ?? null),
    )
    setPlayerProfileChoices((current) =>
      Array.from({ length: count }, (_, index) => current[index] ?? null),
    )
    setResults(null)
    setError(null)
  }

  function toggleAvailableComplexity(complexity: SpiritComplexity) {
    const updated = availableComplexities.includes(complexity)
      ? availableComplexities.filter((item) => item !== complexity)
      : [...availableComplexities, complexity]
    setAvailableComplexities(updated)
    setPlayerSpiritChoices((choices) =>
      choices.map((spiritId, index) => {
        const spirit = spirits.find((candidate) => candidate.id === spiritId)
        const playerSelected = playerComplexities[index] ?? []

        return spirit &&
          (!updated.includes(spirit.complexity) ||
            !playerSelected.includes(spirit.complexity))
          ? null
          : spiritId
      }),
    )
    setError(null)
  }

  function toggleComplexity(
    playerIndex: number,
    complexity: SpiritComplexity,
  ) {
    const updated = playerComplexities.map((selected, index) => {
      if (index !== playerIndex) {
        return selected
      }

      return selected.includes(complexity)
        ? selected.filter((item) => item !== complexity)
        : [...selected, complexity]
    })
    setPlayerComplexities(updated)
    const selectedForPlayer = updated[playerIndex] ?? []
    setPlayerSpiritChoices((choices) =>
      choices.map((spiritId, index) => {
        if (index !== playerIndex || !spiritId) {
          return spiritId
        }

        const spirit = spirits.find((candidate) => candidate.id === spiritId)

        return spirit &&
          (!selectedForPlayer.includes(spirit.complexity) ||
            !availableComplexities.includes(spirit.complexity))
          ? null
          : spiritId
      }),
    )
    setError(null)
  }

  function choosePlayerSpirit(playerIndex: number, spiritId: string) {
    setPlayerSpiritChoices((current) =>
      Array.from({ length: playerCount }, (_, index) =>
        index === playerIndex ? spiritId || null : current[index] ?? null,
      ),
    )
    setError(null)
  }

  function generateSelection() {
    const fixedSpiritChoices = playerSpiritChoices
      .slice(0, playerCount)
      .map((spiritId) =>
        spiritId ? spirits.find((spirit) => spirit.id === spiritId) ?? null : null,
      )
    const chosenSpiritIds = fixedSpiritChoices.flatMap((spirit) =>
      spirit ? [spirit.id] : [],
    )

    if (new Set(chosenSpiritIds).size !== chosenSpiritIds.length) {
      setResults(null)
      setError('Each player must choose a different spirit.')
      return
    }

    const eligibleSpirits = excludeFMatchups(
      spirits,
      selectedAdversary?.id ?? null,
    )
    const recentlyPlayedSpiritIds = playerProfileChoices
      .slice(0, playerCount)
      .map((profileId) =>
        profileId
          ? getRecentlyPlayedSpiritIds(
              profileHistoryState.data.games,
              profileId,
              recentGamesToExclude,
            )
          : new Set<string>(),
      )
    const selection = randomizeSpiritsWithFixedChoices(
      eligibleSpirits,
      applyGlobalComplexityFilter(
        playerComplexities.slice(0, playerCount),
        availableComplexities,
      ),
      fixedSpiritChoices,
      Math.random,
      recentlyPlayedSpiritIds,
      playerProfileChoices
        .slice(0, playerCount)
        .map((profileId) =>
          profileHistoryState.data.profiles.find(
            (profile) => profile.id === profileId,
          )?.spiritWeights ?? {},
        ),
    )

    if (!selection) {
      setResults(null)
      setError(
        selectedAdversary
          ? 'These choices cannot give every player a different spirit while avoiding F-tier matchups and recently played spirits while honoring profile weights. Enable more complexity levels, allow more levels for each player, adjust spirit weights, or change manual spirit choices.'
          : 'These choices cannot give every player a different spirit while avoiding recently played spirits and honoring profile weights. Enable more complexity levels, allow more levels for each player, adjust spirit weights, or change manual spirit choices.',
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
    const profileId = playerProfileChoices[playerIndex]
    const recentlyPlayedSpiritIds = profileId
      ? getRecentlyPlayedSpiritIds(
          profileHistoryState.data.games,
          profileId,
          recentGamesToExclude,
        )
      : new Set<string>()
    const spiritWeights =
      profileHistoryState.data.profiles.find(
        (profile) => profile.id === profileId,
      )?.spiritWeights ?? {}
    const excludedSpiritIds = new Set([
      ...results.map((result) => result.spirit.id),
      ...recentlyPlayedSpiritIds,
    ])
    const replacement = rerollSpirit(
      excludeFMatchups(spirits, selectedAdversary?.id ?? null),
      availableForPlayer,
      excludedSpiritIds,
      Math.random,
      spiritWeights,
    )

    if (!replacement) {
      setError(
        profileId
          ? selectedAdversary
            ? `No different eligible spirit outside this profile’s last 3 games, with a nonzero weight, and without an F-tier matchup is available for Player ${playerNumber} without changing anyone else's spirit. Adjust the complexity choices or spirit weights, or pick spirits again for everyone.`
            : `No different spirit outside this profile’s last 3 games with a nonzero weight is available for Player ${playerNumber} without changing anyone else's spirit. Adjust the complexity choices or spirit weights, or pick spirits again for everyone.`
          : selectedAdversary
            ? `No different eligible spirit without an F-tier matchup is available for Player ${playerNumber} without changing anyone else's spirit. Adjust the complexity choices or pick spirits again for everyone.`
            : `No different eligible spirit is available for Player ${playerNumber} without changing anyone else's spirit. Adjust the complexity choices or pick spirits again for everyone.`,
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

  const assignedProfiles = playerProfileChoices.slice(0, playerCount)
  const canSaveGame =
    Boolean(results && selectedAdversary) &&
    assignedProfiles.every((profileId) =>
      profileHistoryState.data.profiles.some(
        (profile) => profile.id === profileId,
      ),
    ) &&
    new Set(assignedProfiles).size === playerCount

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

        <div
          role="group"
          aria-label="Choose a view"
          className="grid grid-cols-4 gap-2 rounded-xl border border-white/10 bg-[#17211b]/80 p-1.5 sm:w-fit"
        >
          <button
            type="button"
            aria-pressed={activeView === 'picker'}
            onClick={() => setActiveView('picker')}
            aria-label="Spirit picker"
            className={`min-h-11 min-w-0 rounded-lg px-1 text-xs font-semibold transition focus-visible:outline-emerald-300 sm:px-4 sm:text-sm ${
              activeView === 'picker'
                ? 'bg-emerald-300 text-[#102016]'
                : 'text-[#c5cec2] hover:bg-white/5'
            }`}
          >
            <span className="sm:hidden">Picker</span>
            <span className="hidden sm:inline">Spirit picker</span>
          </button>
          <button
            type="button"
            aria-pressed={activeView === 'axis'}
            onClick={() => setActiveView('axis')}
            aria-label="Matchup axis"
            className={`min-h-11 min-w-0 rounded-lg px-1 text-xs font-semibold transition focus-visible:outline-emerald-300 sm:px-4 sm:text-sm ${
              activeView === 'axis'
                ? 'bg-emerald-300 text-[#102016]'
                : 'text-[#c5cec2] hover:bg-white/5'
            }`}
          >
            <span className="sm:hidden">Matchups</span>
            <span className="hidden sm:inline">Matchup axis</span>
          </button>
          <button
            type="button"
            aria-pressed={activeView === 'general-tier-list'}
            onClick={() => setActiveView('general-tier-list')}
            aria-label="Spirit tier list"
            className={`min-h-11 min-w-0 rounded-lg px-1 text-xs font-semibold transition focus-visible:outline-emerald-300 sm:px-4 sm:text-sm ${
              activeView === 'general-tier-list'
                ? 'bg-emerald-300 text-[#102016]'
                : 'text-[#c5cec2] hover:bg-white/5'
            }`}
          >
            <span className="sm:hidden">Tiers</span>
            <span className="hidden sm:inline">Tier list</span>
          </button>
          <button
            type="button"
            aria-pressed={activeView === 'profiles'}
            onClick={() => setActiveView('profiles')}
            aria-label="Profiles and history"
            className={`min-h-11 min-w-0 rounded-lg px-1 text-xs font-semibold transition focus-visible:outline-emerald-300 sm:px-4 sm:text-sm ${
              activeView === 'profiles'
                ? 'bg-emerald-300 text-[#102016]'
                : 'text-[#c5cec2] hover:bg-white/5'
            }`}
          >
            <span className="sm:hidden">Profiles</span>
            <span className="hidden sm:inline">Profiles &amp; history</span>
          </button>
        </div>

        <div className={activeView === 'picker' ? '' : 'hidden'}>
          <AdversarySelector onSelectionChange={changeAdversary} />
        </div>

        <section
          aria-labelledby="setup-title"
          className={
            activeView === 'picker'
              ? 'rounded-2xl border border-white/10 bg-[#17211b]/90 p-5 shadow-2xl shadow-black/10 sm:p-7'
              : 'hidden'
          }
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
            {playerComplexities.slice(0, playerCount).map((selected, index) => {
              const profileId = playerProfileChoices[index]

              return (
                <fieldset
                  key={index}
                  className="rounded-xl border border-white/10 bg-[#101814]/70 p-4"
                >
                  <legend className="px-1">
                    <label
                      className="sr-only"
                      htmlFor={`player-profile-${index + 1}`}
                    >
                      Player {index + 1} profile
                    </label>
                    <select
                      id={`player-profile-${index + 1}`}
                      value={profileId ?? ''}
                      onChange={(event) =>
                        choosePlayerProfile(index, event.target.value)
                      }
                      className="max-w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-[#e2e8de] focus:border-emerald-200/30 focus:bg-[#17211b] focus-visible:outline-emerald-300"
                    >
                      <option value="">Player {index + 1}</option>
                      {profileHistoryState.data.profiles.map((profile) => (
                        <option
                          key={profile.id}
                          value={profile.id}
                          disabled={
                            profile.id !== profileId &&
                            assignedProfiles.includes(profile.id)
                          }
                        >
                          {profile.name}
                        </option>
                      ))}
                    </select>
                  </legend>
                  <label className="mt-2 block text-sm text-[#c5cec2]">
                    Spirit (optional)
                    <select
                      value={playerSpiritChoices[index] ?? ''}
                      onChange={(event) =>
                        choosePlayerSpirit(index, event.target.value)
                      }
                      className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-[#17211b] px-2.5 text-sm text-white focus-visible:outline-emerald-300"
                    >
                      <option value="">Random</option>
                      {sortedSpirits
                        .filter(
                          (spirit) =>
                            selected.includes(spirit.complexity) &&
                            availableComplexities.includes(spirit.complexity),
                        )
                        .map((spirit) => (
                          <option key={spirit.id} value={spirit.id}>
                            {spirit.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <div className="mt-3 grid grid-cols-2 gap-2">
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
                            onChange={() =>
                              toggleComplexity(index, complexity)
                            }
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
              )
            })}
          </div>
          <p className="mt-3 text-xs text-[#95a294]">
            Random picks and rerolls avoid spirits each selected profile played
            in its last 3 saved games. Manual spirit choices are unaffected.
          </p>

          <button
            type="button"
            onClick={generateSelection}
            className="mt-6 min-h-12 w-full rounded-xl bg-emerald-300 px-5 py-3 text-sm font-bold text-[#102016] transition hover:bg-emerald-200 focus-visible:outline-offset-4 sm:w-auto"
          >
            Pick spirits
          </button>
        </section>

        <div
          aria-live="polite"
          className={activeView === 'picker' ? 'mt-7' : 'hidden'}
        >
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
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id="results-title" className="text-xl font-semibold">
                  Your spirits
                </h2>
                {selectedAdversary && (
                  <div className="flex items-center gap-3">
                    <p className="text-right text-sm text-[#aeb9ad]">
                      vs. {selectedAdversary.name}
                    </p>
                    <button
                      type="button"
                      aria-pressed={showMatchupTiers}
                      onClick={() =>
                        setShowMatchupTiers((current) => !current)
                      }
                      className="min-h-9 shrink-0 rounded-lg border border-white/10 px-2.5 text-xs font-medium text-[#b8c2b7] transition hover:border-emerald-200/30 hover:text-emerald-100 focus-visible:outline-emerald-300"
                    >
                      {showMatchupTiers ? 'Hide tiers' : 'Show tiers'}
                    </button>
                  </div>
                )}
              </div>
              <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.map(
                  ({ playerNumber, spirit, selectedAspectId }) => {
                    const playerLabel =
                      profileHistoryState.data.profiles.find(
                        (profile) =>
                          profile.id ===
                          playerProfileChoices[playerNumber - 1],
                      )?.name ?? `Player ${playerNumber}`
                    const selectedAspect = spirit.aspects.find(
                      (aspect) => aspect.id === selectedAspectId,
                    )
                    const selectedArtwork = tierListItemsById.get(spirit.id)
                    const matchupTier = getMatchupTier(
                      selectedAspect?.id ?? spirit.id,
                      selectedAdversary?.id ?? '',
                    )
                    const isFixedChoice =
                      playerSpiritChoices[playerNumber - 1] === spirit.id

                    return (
                      <li
                        key={spirit.id}
                        className="rounded-xl border border-emerald-100/10 bg-[#17211b]/90 p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-emerald-300/80">
                            {playerLabel}
                          </p>
                          <div className="flex shrink-0 items-center gap-2">
                            {matchupTier &&
                              (showMatchupTiers ||
                                matchupTier.startsWith('D') ||
                                matchupTier.startsWith('F')) && (
                              <span
                                className={`inline-flex justify-center rounded-md border px-2 py-1 text-xs font-semibold ${matchupTierColors[matchupTier.charAt(0)]}`}
                                aria-label={`Matchup tier ${matchupTier}`}
                              >
                                {matchupTier} matchup
                              </span>
                            )}
                            {!isFixedChoice && (
                              <button
                                type="button"
                                onClick={() => rerollPlayer(playerNumber)}
                                aria-label={`Reroll spirit for ${playerLabel}`}
                                className="min-h-9 rounded-lg border border-emerald-200/20 px-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-200/40 hover:bg-emerald-200/10 focus-visible:outline-emerald-300"
                              >
                                Reroll
                              </button>
                            )}
                          </div>
                        </div>
                        {selectedArtwork && (
                          <img
                            src={selectedArtwork.imageUrl}
                            alt={`${selectedArtwork.name} artwork`}
                            width={300}
                            height={194}
                            className="mt-4 aspect-[300/194] w-full rounded-lg border border-white/10 object-cover"
                          />
                        )}
                        <h3 className="mt-2 text-lg font-semibold leading-snug text-[#f2f4ed]">
                          {spirit.name}
                        </h3>
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
                                Base spirit
                                {showMatchupTiers && selectedAdversary &&
                                  ` — Tier ${getMatchupTier(
                                    spirit.id,
                                    selectedAdversary.id,
                                  ) ?? 'unavailable'}`}
                              </option>
                              {spirit.aspects.map((aspect) => (
                                <option key={aspect.id} value={aspect.id}>
                                  {aspect.name}
                                  {aspect.complexityModifier === '+'
                                    ? ' (more complex)'
                                    : aspect.complexityModifier === '−'
                                      ? ' (less complex)'
                                      : ''}
                                  {showMatchupTiers && selectedAdversary &&
                                    ` — Tier ${getMatchupTier(
                                      aspect.id,
                                      selectedAdversary.id,
                                    ) ?? 'unavailable'}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </li>
                    )
                  },
                )}
              </ol>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-[#d9e1d5]">
                  Save game:
                </span>
                <button
                  type="button"
                  onClick={() => saveGame('won')}
                  disabled={!canSaveGame}
                  className="min-h-10 rounded-lg border border-emerald-200/20 px-4 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-200/10 focus-visible:outline-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Won
                </button>
                <button
                  type="button"
                  onClick={() => saveGame('lost')}
                  disabled={!canSaveGame}
                  className="min-h-10 rounded-lg border border-rose-200/20 px-4 text-sm font-semibold text-rose-100 transition hover:bg-rose-200/10 focus-visible:outline-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Lost
                </button>
                {!canSaveGame && (
                  <p className="basis-full text-xs text-[#95a294]">
                    Choose an adversary and a different profile for each player
                    to save this game.
                  </p>
                )}
                {profileHistoryMessage && (
                  <p
                    role="status"
                    className="basis-full text-sm text-amber-100"
                  >
                    {profileHistoryMessage}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>

        <div
          className={
            activeView === 'axis'
              ? '-mx-5 w-[calc(100%+2.5rem)] sm:mx-0 sm:w-full'
              : 'hidden'
          }
        >
          <MatchupAxis />
        </div>

        <div className={activeView === 'general-tier-list' ? '' : 'hidden'}>
          <GeneralTierList />
        </div>

        <section
          aria-labelledby="profiles-title"
          className={
            activeView === 'profiles'
              ? 'rounded-2xl border border-white/10 bg-[#17211b]/90 p-5 shadow-2xl shadow-black/10 sm:p-7'
              : 'hidden'
          }
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="profiles-title" className="text-xl font-semibold">
              Profiles and game history
            </h2>
            <p className="text-sm text-[#95a294]">
              {profileHistoryState.data.profiles.length} profiles ·{' '}
              {profileHistoryState.data.games.length} games
            </p>
          </div>

          <form
            onSubmit={addProfile}
            className="mt-5 flex flex-col gap-2 sm:flex-row"
          >
            <label className="sr-only" htmlFor="new-profile-name">
              New profile name
            </label>
            <input
              id="new-profile-name"
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              placeholder="Profile name"
              className="min-h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-[#101814] px-3 text-sm text-white placeholder:text-[#829084] focus-visible:outline-emerald-300"
            />
            <button
              type="submit"
              className="min-h-10 rounded-lg border border-emerald-200/20 px-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-200/10 focus-visible:outline-emerald-300"
            >
              Add profile
            </button>
          </form>

          {profileHistoryState.data.profiles.length > 0 ? (
            <div className="mt-4 space-y-2">
              {profileHistoryState.data.profiles.map((profile) => {
                const weights = profile.spiritWeights ?? {}
                const adjustedWeightCount = Object.values(weights).filter(
                  (weight) => weight !== 1,
                ).length
                const search = profileSpiritSearch[profile.id] ?? ''
                const filteredSpirits = sortedSpirits.filter((spirit) =>
                  spirit.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
                )

                return (
                  <div
                    key={profile.id}
                    className="rounded-xl border border-white/10 bg-[#101814]/70 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <details className="min-w-0 flex-1">
                        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 marker:hidden">
                          <span className="font-medium text-[#e2e8de]">
                            {profile.name}
                          </span>
                          <span className="text-xs text-[#95a294]">
                            {adjustedWeightCount} adjusted · Normal for all
                            others
                          </span>
                        </summary>
                        <div className="mt-3 border-t border-white/10 pt-4">
                          <p className="mb-3 text-sm text-[#95a294]">
                            Set how often each spirit can be randomly picked.
                            These settings save automatically; manual spirit
                            choices are unaffected.
                          </p>
                          <label className="mb-3 block">
                            <span className="sr-only">
                              Search spirits for {profile.name}
                            </span>
                            <input
                              type="search"
                              value={search}
                              onChange={(event) =>
                                setProfileSpiritSearch((current) => ({
                                  ...current,
                                  [profile.id]: event.target.value,
                                }))
                              }
                              placeholder="Search spirits"
                              className="min-h-10 w-full rounded-lg border border-white/10 bg-[#17211b] px-3 text-sm text-white placeholder:text-[#829084] focus-visible:outline-emerald-300"
                            />
                          </label>
                          <ul className="max-h-96 space-y-1 overflow-y-auto">
                            {filteredSpirits.map((spirit) => {
                              const weight = weights[spirit.id] ?? 1

                              return (
                                <li
                                  key={spirit.id}
                                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-white/5"
                                >
                                  <span className="truncate text-sm text-[#d9e1d5]">
                                    {spirit.name}
                                  </span>
                                  <select
                                    aria-label={`${spirit.name} weight for ${profile.name}`}
                                    value={String(weight)}
                                    onChange={(event) => {
                                      const nextWeight =
                                        spiritWeightOptions.find(
                                          (option) =>
                                            String(option.value) ===
                                            event.target.value,
                                        )?.value
                                      if (nextWeight !== undefined) {
                                        updateProfileSpiritWeight(
                                          profile.id,
                                          spirit.id,
                                          nextWeight,
                                        )
                                      }
                                    }}
                                    className="min-h-9 max-w-44 rounded-lg border border-white/10 bg-[#17211b] px-2 text-xs text-white focus-visible:outline-emerald-300"
                                  >
                                    {spiritWeightOptions.map((option) => (
                                      <option
                                        key={option.value}
                                        value={String(option.value)}
                                      >
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </li>
                              )
                            })}
                            {filteredSpirits.length === 0 && (
                              <li className="px-2 py-3 text-sm text-[#95a294]">
                                No spirits match that search.
                              </li>
                            )}
                          </ul>
                        </div>
                      </details>
                      <button
                        type="button"
                        onClick={() => removeProfile(profile.id)}
                        aria-label={`Remove profile ${profile.name}`}
                        className="min-h-8 rounded-md border border-white/10 px-2.5 text-xs text-[#b8c2b7] hover:bg-white/5 focus-visible:outline-emerald-300"
                      >
                        Remove profile
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#95a294]">
              No profiles yet. Add one above to assign players and save games.
            </p>
          )}

          <div className="mt-8 border-t border-white/10 pt-5">
            <h3 className="text-lg font-semibold text-[#e2e8de]">Saved games</h3>
            {profileHistoryState.data.games.length > 0 ? (
              <ol className="mt-3 max-h-96 space-y-2 overflow-y-auto">
                {profileHistoryState.data.games.map((game) => {
                  const isEditing = editingGame?.id === game.id
                  const gameBeingEdited = isEditing ? editingGame : null
                  const adversaryStillAvailable = adversaries.some(
                    (adversary) => adversary.id === gameBeingEdited?.adversaryId,
                  )

                  return (
                    <li
                      key={game.id}
                      className="rounded-lg border border-white/10 bg-[#101814]/70 p-3 text-sm"
                    >
                      {gameBeingEdited ? (
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold text-[#e2e8de]">
                              Edit saved game
                            </p>
                            <p className="text-xs text-[#95a294]">
                              {new Date(game.playedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="text-sm text-[#c5cec2]">
                              Adversary
                              <select
                                value={gameBeingEdited.adversaryId}
                                onChange={(event) => {
                                  const adversary = adversaries.find(
                                    (candidate) =>
                                      candidate.id === event.target.value,
                                  )
                                  if (adversary) {
                                    setEditingGame((current) =>
                                      current
                                        ? {
                                            ...current,
                                            adversaryId: adversary.id,
                                            adversaryName: adversary.name,
                                          }
                                        : null,
                                    )
                                  }
                                }}
                                className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-[#17211b] px-2.5 text-sm text-white focus-visible:outline-emerald-300"
                              >
                                {!adversaryStillAvailable && (
                                  <option value={gameBeingEdited.adversaryId}>
                                    {gameBeingEdited.adversaryName}
                                  </option>
                                )}
                                {adversaries.map((adversary) => (
                                  <option
                                    key={adversary.id}
                                    value={adversary.id}
                                  >
                                    {adversary.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="text-sm text-[#c5cec2]">
                              Result
                              <select
                                value={gameBeingEdited.outcome}
                                onChange={(event) =>
                                  setEditingGame((current) =>
                                    current
                                      ? {
                                          ...current,
                                          outcome:
                                            event.target.value === 'won'
                                              ? 'won'
                                              : 'lost',
                                        }
                                      : null,
                                  )
                                }
                                className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-[#17211b] px-2.5 text-sm text-white focus-visible:outline-emerald-300"
                              >
                                <option value="won">Won</option>
                                <option value="lost">Lost</option>
                              </select>
                            </label>
                          </div>
                          <div className="space-y-3">
                            {gameBeingEdited.players.map((player, index) => {
                              const spirit = spirits.find(
                                (candidate) => candidate.id === player.spiritId,
                              )
                              const selectedProfileExists =
                                profileHistoryState.data.profiles.some(
                                  (profile) => profile.id === player.profileId,
                                )

                              return (
                                <fieldset
                                  key={`${gameBeingEdited.id}-${player.profileId}-${index}`}
                                  className="grid gap-3 rounded-lg border border-white/10 p-3 sm:grid-cols-3"
                                >
                                  <legend className="px-1 text-xs font-medium text-[#95a294]">
                                    Player {index + 1}
                                  </legend>
                                  <label className="text-sm text-[#c5cec2]">
                                    Profile
                                    <select
                                      value={player.profileId}
                                      onChange={(event) => {
                                        const profile =
                                          profileHistoryState.data.profiles.find(
                                            (candidate) =>
                                              candidate.id === event.target.value,
                                          )
                                        if (profile) {
                                          updateEditingGamePlayer(index, {
                                            profileId: profile.id,
                                            profileName: profile.name,
                                          })
                                        }
                                      }}
                                      className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-[#17211b] px-2.5 text-sm text-white focus-visible:outline-emerald-300"
                                    >
                                      {!selectedProfileExists && (
                                        <option value={player.profileId}>
                                          {player.profileName} (removed profile)
                                        </option>
                                      )}
                                      {profileHistoryState.data.profiles.map(
                                        (profile) => (
                                          <option
                                            key={profile.id}
                                            value={profile.id}
                                            disabled={gameBeingEdited.players.some(
                                              (other, otherIndex) =>
                                                otherIndex !== index &&
                                                other.profileId === profile.id,
                                            )}
                                          >
                                            {profile.name}
                                          </option>
                                        ),
                                      )}
                                    </select>
                                  </label>
                                  <label className="text-sm text-[#c5cec2]">
                                    Spirit
                                    <select
                                      value={player.spiritId}
                                      onChange={(event) => {
                                        const nextSpirit = spirits.find(
                                          (candidate) =>
                                            candidate.id === event.target.value,
                                        )
                                        if (nextSpirit) {
                                          updateEditingGamePlayer(index, {
                                            spiritId: nextSpirit.id,
                                            spiritName: nextSpirit.name,
                                            aspectName: null,
                                          })
                                        }
                                      }}
                                      className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-[#17211b] px-2.5 text-sm text-white focus-visible:outline-emerald-300"
                                    >
                                      {!spirit && (
                                        <option value={player.spiritId}>
                                          {player.spiritName}
                                        </option>
                                      )}
                                      {sortedSpirits.map((candidate) => (
                                        <option
                                          key={candidate.id}
                                          value={candidate.id}
                                        >
                                          {candidate.name}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                  <label className="text-sm text-[#c5cec2]">
                                    Aspect
                                    <select
                                      value={player.aspectName ?? ''}
                                      disabled={!spirit}
                                      onChange={(event) =>
                                        updateEditingGamePlayer(index, {
                                          aspectName:
                                            event.target.value || null,
                                        })
                                      }
                                      className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-[#17211b] px-2.5 text-sm text-white focus-visible:outline-emerald-300 disabled:opacity-50"
                                    >
                                      <option value="">Base spirit</option>
                                      {spirit?.aspects.map((aspect) => (
                                        <option
                                          key={aspect.id}
                                          value={aspect.name}
                                        >
                                          {aspect.name}
                                        </option>
                                      ))}
                                      {player.aspectName &&
                                        !spirit?.aspects.some(
                                          (aspect) =>
                                            aspect.name === player.aspectName,
                                        ) && (
                                          <option value={player.aspectName}>
                                            {player.aspectName}
                                          </option>
                                        )}
                                    </select>
                                  </label>
                                </fieldset>
                              )
                            })}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={saveEditedGame}
                              className="min-h-9 rounded-lg bg-emerald-300 px-3 text-sm font-semibold text-[#102016] hover:bg-emerald-200 focus-visible:outline-emerald-300"
                            >
                              Save changes
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingGame(null)
                                setProfileHistoryMessage(null)
                              }}
                              className="min-h-9 rounded-lg border border-white/10 px-3 text-sm text-[#c5cec2] hover:bg-white/5 focus-visible:outline-emerald-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p className="font-semibold text-[#e2e8de]">
                              {game.adversaryName}
                            </p>
                            <p className="text-xs text-[#95a294]">
                              {new Date(game.playedAt).toLocaleString()}
                            </p>
                            <span
                              className={
                                game.outcome === 'won'
                                  ? 'text-emerald-200'
                                  : 'text-rose-200'
                              }
                            >
                              {game.outcome === 'won' ? 'Won' : 'Lost'}
                            </span>
                          </div>
                          <ul className="mt-2 space-y-1 text-[#b8c2b7]">
                            {game.players.map((player) => (
                              <li key={`${game.id}-${player.profileId}`}>
                                {player.profileName}: {player.spiritName}
                                {player.aspectName
                                  ? ` (${player.aspectName})`
                                  : ''}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditingGame(game)}
                              className="min-h-8 rounded-md border border-white/10 px-2.5 text-xs font-medium text-[#c5cec2] hover:bg-white/5 focus-visible:outline-emerald-300"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSavedGame(game)}
                              className="min-h-8 rounded-md border border-rose-200/20 px-2.5 text-xs font-medium text-rose-100 hover:bg-rose-200/10 focus-visible:outline-rose-300"
                            >
                              Remove
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-[#95a294]">
                Games you save from the spirit picker will appear here.
              </p>
            )}
          </div>

          {(profileHistoryState.error || profileHistoryMessage) && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-amber-200/20 bg-amber-950/30 px-3 py-2 text-sm text-amber-100"
            >
              {profileHistoryMessage ?? profileHistoryState.error}
            </p>
          )}
        </section>

      </main>
    </div>
  )
}

export default App
