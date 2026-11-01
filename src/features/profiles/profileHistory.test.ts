import { describe, expect, it } from 'vitest'
import {
  emptyProfileHistory,
  readProfileHistory,
  type ProfileHistoryData,
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
})
