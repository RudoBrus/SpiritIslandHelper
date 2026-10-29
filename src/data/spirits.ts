import type { Spirit } from '../types/spirit'
import { aspectsBySpiritId } from './aspects'

const spiritMetadata = [
  {
    id: 'lightnings-swift-strike',
    name: "Lightning's Swift Strike",
    complexity: 'Low',
    expansion: 'Base Game',
  },
  {
    id: 'river-surges-in-sunlight',
    name: 'River Surges in Sunlight',
    complexity: 'Low',
    expansion: 'Base Game',
  },
  {
    id: 'shadows-flicker-like-flame',
    name: 'Shadows Flicker Like Flame',
    complexity: 'Low',
    expansion: 'Base Game',
  },
  {
    id: 'vital-strength-of-the-earth',
    name: 'Vital Strength of the Earth',
    complexity: 'Low',
    expansion: 'Base Game',
  },
  {
    id: 'a-spread-of-rampant-green',
    name: 'A Spread of Rampant Green',
    complexity: 'Moderate',
    expansion: 'Base Game',
  },
  {
    id: 'thunderspeaker',
    name: 'Thunderspeaker',
    complexity: 'Moderate',
    expansion: 'Base Game',
  },
  {
    id: 'bringer-of-dreams-and-nightmares',
    name: 'Bringer of Dreams and Nightmares',
    complexity: 'High',
    expansion: 'Base Game',
  },
  {
    id: 'oceans-hungry-grasp',
    name: "Ocean's Hungry Grasp",
    complexity: 'High',
    expansion: 'Base Game',
  },
  {
    id: 'downpour-drenches-the-world',
    name: 'Downpour Drenches the World',
    complexity: 'High',
    expansion: 'Feather and Flame',
  },
  {
    id: 'finder-of-paths-unseen',
    name: 'Finder of Paths Unseen',
    complexity: 'Very High',
    expansion: 'Feather and Flame',
  },
  {
    id: 'heart-of-the-wildfire',
    name: 'Heart of the Wildfire',
    complexity: 'High',
    expansion: 'Feather and Flame',
  },
  {
    id: 'serpent-slumbering-beneath-the-island',
    name: 'Serpent Slumbering Beneath the Island',
    complexity: 'High',
    expansion: 'Feather and Flame',
  },
  {
    id: 'ember-eyed-behemoth',
    name: 'Ember-Eyed Behemoth',
    complexity: 'Moderate',
    expansion: 'Nature Incarnate',
  },
  {
    id: 'hearth-vigil',
    name: 'Hearth-Vigil',
    complexity: 'Moderate',
    expansion: 'Nature Incarnate',
  },
  {
    id: 'towering-roots-of-the-jungle',
    name: 'Towering Roots of the Jungle',
    complexity: 'Moderate',
    expansion: 'Nature Incarnate',
  },
  {
    id: 'breath-of-darkness-down-your-spine',
    name: 'Breath of Darkness Down Your Spine',
    complexity: 'High',
    expansion: 'Nature Incarnate',
  },
  {
    id: 'relentless-gaze-of-the-sun',
    name: 'Relentless Gaze of the Sun',
    complexity: 'High',
    expansion: 'Nature Incarnate',
  },
  {
    id: 'wandering-voice-keens-delirium',
    name: 'Wandering Voice Keens Delirium',
    complexity: 'High',
    expansion: 'Nature Incarnate',
  },
  {
    id: 'wounded-waters-bleeding',
    name: 'Wounded Waters Bleeding',
    complexity: 'High',
    expansion: 'Nature Incarnate',
  },
  {
    id: 'dances-up-earthquakes',
    name: 'Dances Up Earthquakes',
    complexity: 'Very High',
    expansion: 'Nature Incarnate',
  },
  {
    id: 'grinning-trickster-stirs-up-trouble',
    name: 'Grinning Trickster Stirs Up Trouble',
    complexity: 'Moderate',
    expansion: 'Jagged Earth',
  },
  {
    id: 'lure-of-the-deep-wilderness',
    name: 'Lure of the Deep Wilderness',
    complexity: 'Moderate',
    expansion: 'Jagged Earth',
  },
  {
    id: 'many-minds-move-as-one',
    name: 'Many Minds Move as One',
    complexity: 'Moderate',
    expansion: 'Jagged Earth',
  },
  {
    id: 'shifting-memory-of-ages',
    name: 'Shifting Memory of Ages',
    complexity: 'Moderate',
    expansion: 'Jagged Earth',
  },
  {
    id: 'stones-unyielding-defiance',
    name: "Stone's Unyielding Defiance",
    complexity: 'Moderate',
    expansion: 'Jagged Earth',
  },
  {
    id: 'volcano-looming-high',
    name: 'Volcano Looming High',
    complexity: 'Moderate',
    expansion: 'Jagged Earth',
  },
  {
    id: 'shroud-of-silent-mist',
    name: 'Shroud of Silent Mist',
    complexity: 'High',
    expansion: 'Jagged Earth',
  },
  {
    id: 'vengeance-as-a-burning-plague',
    name: 'Vengeance as a Burning Plague',
    complexity: 'High',
    expansion: 'Jagged Earth',
  },
  {
    id: 'fractured-days-split-the-sky',
    name: 'Fractured Days Split the Sky',
    complexity: 'Very High',
    expansion: 'Jagged Earth',
  },
  {
    id: 'starlight-seeks-its-form',
    name: 'Starlight Seeks Its Form',
    complexity: 'Very High',
    expansion: 'Jagged Earth',
  },
  {
    id: 'devouring-teeth-lurk-underfoot',
    name: 'Devouring Teeth Lurk Underfoot',
    complexity: 'Low',
    expansion: 'Horizons of Spirit Island',
  },
  {
    id: 'eyes-watch-from-the-trees',
    name: 'Eyes Watch from the Trees',
    complexity: 'Low',
    expansion: 'Horizons of Spirit Island',
  },
  {
    id: 'fathomless-mud-of-the-swamp',
    name: 'Fathomless Mud of the Swamp',
    complexity: 'Low',
    expansion: 'Horizons of Spirit Island',
  },
  {
    id: 'rising-heat-of-stone-and-sand',
    name: 'Rising Heat of Stone and Sand',
    complexity: 'Low',
    expansion: 'Horizons of Spirit Island',
  },
  {
    id: 'sun-bright-whirlwind',
    name: 'Sun-Bright Whirlwind',
    complexity: 'Low',
    expansion: 'Horizons of Spirit Island',
  },
  {
    id: 'keeper-of-the-forbidden-wilds',
    name: 'Keeper of the Forbidden Wilds',
    complexity: 'Moderate',
    expansion: 'Branch and Claw',
  },
  {
    id: 'sharp-fangs-behind-the-leaves',
    name: 'Sharp Fangs Behind the Leaves',
    complexity: 'Moderate',
    expansion: 'Branch and Claw',
  },
] satisfies readonly Omit<
  Spirit,
  'artworkUrl' | 'artworkPageUrl' | 'aspects'
>[]

function getArtworkPageUrl(name: string): string {
  const fileTitle = `${name}.png`.replaceAll(' ', '_')
  const encodedTitle = encodeURIComponent(fileTitle).replaceAll("'", '%27')

  return `https://spiritislandwiki.com/index.php/File:${encodedTitle}`
}

export const spirits: readonly Spirit[] = spiritMetadata.map((spirit) => ({
  ...spirit,
  artworkUrl: null,
  artworkPageUrl: getArtworkPageUrl(spirit.name),
  aspects: aspectsBySpiritId[spirit.id] ?? [],
}))
