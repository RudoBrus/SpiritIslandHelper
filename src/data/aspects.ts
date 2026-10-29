import type { SpiritAspect } from '../types/spirit'

export const aspectsBySpiritId: Readonly<Record<string, readonly SpiritAspect[]>> = {
  'lightnings-swift-strike': [
    {
      id: 'lightning-immense',
      name: 'Immense',
      expansion: 'Feather and Flame',
      complexityModifier: '+',
    },
    {
      id: 'lightning-pandemonium',
      name: 'Pandemonium',
      expansion: 'Jagged Earth',
      complexityModifier: '+',
    },
    {
      id: 'lightning-wind',
      name: 'Wind',
      expansion: 'Jagged Earth',
      complexityModifier: '+',
    },
    {
      id: 'lightning-sparking',
      name: 'Sparking',
      expansion: 'Nature Incarnate',
      complexityModifier: '+',
    },
  ],
  'river-surges-in-sunlight': [
    {
      id: 'river-travel',
      name: 'Travel',
      expansion: 'Feather and Flame',
      complexityModifier: '+',
    },
    {
      id: 'river-sunshine',
      name: 'Sunshine',
      expansion: 'Jagged Earth',
      complexityModifier: '+',
    },
    {
      id: 'river-haven',
      name: 'Haven',
      expansion: 'Nature Incarnate',
      complexityModifier: '+',
    },
  ],
  'shadows-flicker-like-flame': [
    {
      id: 'shadows-amorphous',
      name: 'Amorphous',
      expansion: 'Feather and Flame',
      complexityModifier: '+',
    },
    {
      id: 'shadows-foreboding',
      name: 'Foreboding',
      expansion: 'Feather and Flame',
      complexityModifier: '+',
    },
    {
      id: 'shadows-reach',
      name: 'Reach',
      expansion: 'Jagged Earth',
      complexityModifier: '−',
    },
    {
      id: 'shadows-madness',
      name: 'Madness',
      expansion: 'Jagged Earth',
      complexityModifier: '+',
    },
    {
      id: 'shadows-dark-fire',
      name: 'Dark Fire',
      expansion: 'Nature Incarnate',
      complexityModifier: '+',
    },
  ],
  'vital-strength-of-the-earth': [
    {
      id: 'earth-might',
      name: 'Might',
      expansion: 'Feather and Flame',
      complexityModifier: '+',
    },
    {
      id: 'earth-resilience',
      name: 'Resilience',
      expansion: 'Jagged Earth',
      complexityModifier: '=',
    },
    {
      id: 'earth-nourishing',
      name: 'Nourishing',
      expansion: 'Nature Incarnate',
      complexityModifier: '+',
    },
  ],
  'a-spread-of-rampant-green': [
    {
      id: 'green-regrowth',
      name: 'Regrowth',
      expansion: 'Nature Incarnate',
      complexityModifier: '+',
    },
    {
      id: 'green-tangles',
      name: 'Tangles',
      expansion: 'Nature Incarnate',
      complexityModifier: '+',
    },
  ],
  'thunderspeaker': [
    {
      id: 'thunderspeaker-tactician',
      name: 'Tactician',
      expansion: 'Nature Incarnate',
      complexityModifier: '=',
    },
    {
      id: 'thunderspeaker-warrior',
      name: 'Warrior',
      expansion: 'Nature Incarnate',
      complexityModifier: '+',
    },
  ],
  'bringer-of-dreams-and-nightmares': [
    {
      id: 'bringer-enticing',
      name: 'Enticing',
      expansion: 'Nature Incarnate',
      complexityModifier: '=',
    },
    {
      id: 'bringer-violence',
      name: 'Violence',
      expansion: 'Nature Incarnate',
      complexityModifier: '+',
    },
  ],
  'oceans-hungry-grasp': [
    {
      id: 'ocean-deeps',
      name: 'Deeps',
      expansion: 'Nature Incarnate',
      complexityModifier: '+',
    },
  ],
  'heart-of-the-wildfire': [
    {
      id: 'wildfire-transforming',
      name: 'Transforming',
      expansion: 'Nature Incarnate',
      complexityModifier: '+',
    },
  ],
  'serpent-slumbering-beneath-the-island': [
    {
      id: 'serpent-locus',
      name: 'Locus',
      expansion: 'Nature Incarnate',
      complexityModifier: '+',
    },
  ],
  'keeper-of-the-forbidden-wilds': [
    {
      id: 'keeper-spreading-hostility',
      name: 'Spreading Hostility',
      expansion: 'Nature Incarnate',
      complexityModifier: '+',
    },
  ],
  'lure-of-the-deep-wilderness': [
    {
      id: 'lure-lair',
      name: 'Lair',
      expansion: 'Nature Incarnate',
      complexityModifier: '+',
    },
  ],
  'sharp-fangs-behind-the-leaves': [
    {
      id: 'fangs-encircle',
      name: 'Encircle',
      expansion: 'Nature Incarnate',
      complexityModifier: '=',
    },
    {
      id: 'fangs-unconstrained',
      name: 'Unconstrained',
      expansion: 'Nature Incarnate',
      complexityModifier: '−',
    },
  ],
  'shifting-memory-of-ages': [
    {
      id: 'memory-intensify',
      name: 'Intensify',
      expansion: 'Nature Incarnate',
      complexityModifier: '+',
    },
    {
      id: 'memory-mentor',
      name: 'Mentor',
      expansion: 'Nature Incarnate',
      complexityModifier: '+',
    },
  ],
  'shroud-of-silent-mist': [
    {
      id: 'shroud-stranded',
      name: 'Stranded',
      expansion: 'Nature Incarnate',
      complexityModifier: '−',
    },
  ],
}
