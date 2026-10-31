import { spirits } from '../../data/spirits'

export const tierNames = [
  'X',
  'S',
  'A',
  'B',
  'C',
  'D',
  'F',
] as const

export type TierName = (typeof tierNames)[number]

export type TierListItem = {
  readonly id: string
  readonly name: string
  readonly imageUrl: string
}

const imageNameExceptions: Readonly<Record<string, string>> = {
  'ember-eyed-behemoth': 'ember-eyedbehemoth',
  'hearth-vigil': 'hearth-vigil',
  'shadows-foreboding': 'shadowsflickerlikeflameforboding',
  'serpent-locus': 'serpentslumberingbeneaththeisland-locus',
  'sun-bright-whirlwind': 'sun-brightwhirlwind',
}

function compactName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function getImageName(id: string, spiritName: string, aspectName?: string) {
  const exception = imageNameExceptions[id]

  if (exception) {
    return exception
  }

  return `${compactName(spiritName)}${aspectName ? compactName(aspectName) : ''}`
}

export const tierListItems: readonly TierListItem[] = spirits.flatMap(
  (spirit) => [
    {
      id: spirit.id,
      name: spirit.name,
      imageUrl: `${import.meta.env.BASE_URL}spirit-art/tiermaker/${getImageName(
        spirit.id,
        spirit.name,
      )}.png`,
    },
    ...spirit.aspects.map((aspect) => ({
      id: aspect.id,
      name: `${spirit.name}: ${aspect.name}`,
      imageUrl: `${import.meta.env.BASE_URL}spirit-art/tiermaker/${getImageName(
        aspect.id,
        spirit.name,
        aspect.name,
      )}.png`,
    })),
  ],
)

const initialSpiritTiers: Readonly<Record<TierName, readonly string[]>> = {
  X: [
    'fractured-days-split-the-sky',
    'stones-unyielding-defiance',
    'green-regrowth',
    'a-spread-of-rampant-green',
    'dances-up-earthquakes',
    'hearth-vigil',
  ],
  S: [
    'starlight-seeks-its-form',
    'many-minds-move-as-one',
    'downpour-drenches-the-world',
    'relentless-gaze-of-the-sun',
    'earth-nourishing',
    'memory-intensify',
    'keeper-of-the-forbidden-wilds',
    'finder-of-paths-unseen',
  ],
  A: [
    'towering-roots-of-the-jungle',
    'river-travel',
    'grinning-trickster-stirs-up-trouble',
    'volcano-looming-high',
    'eyes-watch-from-the-trees',
    'lightning-sparking',
    'serpent-slumbering-beneath-the-island',
    'green-tangles',
    'lure-of-the-deep-wilderness',
  ],
  B: [
    'ember-eyed-behemoth',
    'wandering-voice-keens-delirium',
    'fangs-encircle',
    'fangs-unconstrained',
    'sharp-fangs-behind-the-leaves',
    'vengeance-as-a-burning-plague',
    'rising-heat-of-stone-and-sand',
    'wildfire-transforming',
    'bringer-enticing',
    'bringer-violence',
    'breath-of-darkness-down-your-spine',
    'thunderspeaker',
    'river-surges-in-sunlight',
    'lightning-wind',
    'wounded-waters-bleeding',
    'sun-bright-whirlwind',
    'shroud-stranded',
    'lure-lair',
    'fathomless-mud-of-the-swamp',
    'river-haven',
    'keeper-spreading-hostility',
  ],
  C: [
    'serpent-locus',
    'earth-might',
    'ocean-deeps',
    'oceans-hungry-grasp',
    'lightning-pandemonium',
    'lightnings-swift-strike',
    'bringer-of-dreams-and-nightmares',
    'memory-mentor',
    'shifting-memory-of-ages',
    'shadows-dark-fire',
  ],
  D: [
    'thunderspeaker-warrior',
    'thunderspeaker-tactician',
    'lightning-immense',
    'heart-of-the-wildfire',
    'shroud-of-silent-mist',
    'earth-resilience',
    'vital-strength-of-the-earth',
    'devouring-teeth-lurk-underfoot',
    'shadows-foreboding',
  ],
  F: [
    'shadows-amorphous',
    'shadows-reach',
    'shadows-madness',
    'shadows-flicker-like-flame',
    'river-sunshine',
  ],
}

export type TierPlacements = Record<TierName, string[]>

const assignedItemIds = new Set(
  tierNames.flatMap((tier) => initialSpiritTiers[tier]),
)

const unlistedItems = tierListItems
  .filter((item) => !assignedItemIds.has(item.id))
  .map((item) => item.id)

export const defaultTierPlacements = Object.fromEntries(
  tierNames.map((tier) => [
    tier,
    tier === 'B'
      ? [...initialSpiritTiers.B, ...unlistedItems]
      : [...initialSpiritTiers[tier]],
  ]),
) as TierPlacements

export const defaultTierByItemId: Readonly<Record<string, TierName>> =
  Object.fromEntries(
    tierNames.flatMap((tier) =>
      defaultTierPlacements[tier].map((itemId) => [itemId, tier]),
    ),
  )

export function readTierPlacements(value: string | null): TierPlacements | null {
  if (!value) {
    return null
  }

  const parsed: unknown = JSON.parse(value)

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return null
  }

  const saved = parsed as Partial<Record<TierName, unknown>>
  const knownItemIds = new Set(tierListItems.map((item) => item.id))
  const seenItemIds = new Set<string>()
  const placements = Object.fromEntries(
    tierNames.map((tier) => {
      const savedItemIds = saved[tier]

      if (savedItemIds !== undefined && !Array.isArray(savedItemIds)) {
        return [tier, []]
      }

      const tierItemIds = new Set<string>()
      const itemIds = (Array.isArray(savedItemIds) ? savedItemIds : []).filter(
        (itemId): itemId is string => {
          if (
            typeof itemId !== 'string' ||
            !knownItemIds.has(itemId) ||
            seenItemIds.has(itemId) ||
            tierItemIds.has(itemId)
          ) {
            return false
          }

          tierItemIds.add(itemId)
          return true
        },
      )

      itemIds.forEach((itemId) => seenItemIds.add(itemId))
      return [tier, itemIds]
    }),
  ) as TierPlacements

  for (const tier of tierNames) {
    for (const itemId of defaultTierPlacements[tier]) {
      if (!seenItemIds.has(itemId)) {
        placements[tier].push(itemId)
        seenItemIds.add(itemId)
      }
    }
  }

  return placements
}
