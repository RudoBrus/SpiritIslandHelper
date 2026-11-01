import { describe, expect, it } from 'vitest'
import {
  emptyProfileHistory,
  getRecentlyPlayedSpiritIds,
  readProfileHistory,
  type ProfileHistoryData,
  type SavedGame,
} from './profileHistory'

describe('profile history data', () => {
  it('starts empty when there is no saved browser data', () => {
    expect(readProfileHistory(null)).toEqual(emptyProfileHistory)
  })

  it('reads named profiles and saved game results', () => {
    const data: ProfileHistoryData = {
      profiles: [{ id: 'profile-1', name: 'Alex' }],
      games: [
        {
          id: 'game-1',
          playedAt: '2026-11-01T10:00:00.000Z',
          outcome: 'won',
          adversaryId: 'england',
          adversaryName: 'England',
          players: [
            {
              profileId: 'profile-1',
              profileName: 'Alex',
              spiritId: 'river-surges-in-sunlight',
              spiritName: 'River Surges in Sunlight',
              aspectName: 'Travel',
            },
          ],
        },
      ],
    }

    expect(
      readProfileHistory(JSON.stringify({ version: 1, ...data })),
    ).toEqual(data)
  })

  it('rejects invalid stored profile or game data', () => {
    expect(
      readProfileHistory(
        JSON.stringify({
          version: 1,
          profiles: [{ id: 'missing-name' }],
          games: [],
        }),
      ),
    ).toBeNull()
    expect(
      readProfileHistory(
        JSON.stringify({ version: 1, profiles: [], games: [{ outcome: 'maybe' }] }),
      ),
    ).toBeNull()
  })

  it('accepts spirit weights and rejects invalid weights', () => {
    const profile = {
      id: 'profile-1',
      name: 'Alex',
      spiritWeights: {
        'spirit-never': 0,
        'spirit-frequent': 4,
      },
    }

    expect(
      readProfileHistory(
        JSON.stringify({ version: 1, profiles: [profile], games: [] }),
      )?.profiles,
    ).toEqual([profile])
    expect(
      readProfileHistory(
        JSON.stringify({
          version: 1,
          profiles: [
            {
              ...profile,
              spiritWeights: { 'spirit-invalid': 3 },
            },
          ],
          games: [],
        }),
      ),
    ).toBeNull()
  })

  it('gets spirits from the most recent games played by a profile', () => {
    const games: SavedGame[] = [
      {
        id: 'game-1',
        playedAt: '2026-10-01T10:00:00.000Z',
        outcome: 'won',
        adversaryId: 'england',
        adversaryName: 'England',
        players: [
          {
            profileId: 'profile-1',
            profileName: 'Alex',
            spiritId: 'spirit-old',
            spiritName: 'Old Spirit',
            aspectName: null,
          },
        ],
      },
      {
        id: 'game-3',
        playedAt: '2026-10-03T10:00:00.000Z',
        outcome: 'won',
        adversaryId: 'england',
        adversaryName: 'England',
        players: [
          {
            profileId: 'profile-1',
            profileName: 'Alex',
            spiritId: 'spirit-recent-3',
            spiritName: 'Recent Spirit 3',
            aspectName: null,
          },
          {
            profileId: 'profile-2',
            profileName: 'Sam',
            spiritId: 'spirit-sam',
            spiritName: 'Sam Spirit',
            aspectName: null,
          },
        ],
      },
      {
        id: 'game-2',
        playedAt: '2026-10-02T10:00:00.000Z',
        outcome: 'lost',
        adversaryId: 'england',
        adversaryName: 'England',
        players: [
          {
            profileId: 'profile-1',
            profileName: 'Alex',
            spiritId: 'spirit-recent-2',
            spiritName: 'Recent Spirit 2',
            aspectName: null,
          },
        ],
      },
      {
        id: 'game-4',
        playedAt: '2026-10-04T10:00:00.000Z',
        outcome: 'lost',
        adversaryId: 'england',
        adversaryName: 'England',
        players: [
          {
            profileId: 'profile-1',
            profileName: 'Alex',
            spiritId: 'spirit-recent-4',
            spiritName: 'Recent Spirit 4',
            aspectName: null,
          },
        ],
      },
    ]

    expect(getRecentlyPlayedSpiritIds(games, 'profile-1', 3)).toEqual(
      new Set(['spirit-recent-2', 'spirit-recent-3', 'spirit-recent-4']),
    )
    expect(getRecentlyPlayedSpiritIds(games, 'profile-2', 3)).toEqual(
      new Set(['spirit-sam']),
    )
  })
})
