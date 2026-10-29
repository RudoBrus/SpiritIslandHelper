import type { Adversary } from '../types/adversary'

export const adversaries = [
  {
    id: 'sweden',
    name: 'Sweden',
    expansion: 'Base Game',
    level6Difficulty: 8,
    wikiUrl: 'https://spiritislandwiki.com/index.php/Sweden',
  },
  {
    id: 'brandenburg-prussia',
    name: 'Brandenburg-Prussia',
    expansion: 'Base Game',
    level6Difficulty: 10,
    wikiUrl: 'https://spiritislandwiki.com/index.php/Brandenburg-Prussia',
  },
  {
    id: 'france',
    name: 'France (Plantation Colony)',
    expansion: 'Branch and Claw',
    level6Difficulty: 10,
    wikiUrl:
      'https://spiritislandwiki.com/index.php/France_(Plantation_Colony)',
  },
  {
    id: 'habsburg-livestock-colony',
    name: 'Habsburg Monarchy (Livestock Colony)',
    expansion: 'Jagged Earth',
    level6Difficulty: 10,
    wikiUrl: 'https://spiritislandwiki.com/index.php/Habsburg_Monarchy',
  },
  {
    id: 'scotland',
    name: 'Scotland',
    expansion: 'Feather and Flame',
    level6Difficulty: 10,
    wikiUrl: 'https://spiritislandwiki.com/index.php/Scotland',
  },
  {
    id: 'habsburg-mining-expedition',
    name: 'Habsburg Mining Expedition',
    expansion: 'Nature Incarnate',
    level6Difficulty: 10,
    wikiUrl:
      'https://spiritislandwiki.com/index.php/Habsburg_Mining_Expedition',
  },
  {
    id: 'england',
    name: 'England',
    expansion: 'Base Game',
    level6Difficulty: 11,
    wikiUrl: 'https://spiritislandwiki.com/index.php/England',
  },
  {
    id: 'russia',
    name: 'Russia',
    expansion: 'Jagged Earth',
    level6Difficulty: 11,
    wikiUrl: 'https://spiritislandwiki.com/index.php/Russia',
  },
] satisfies readonly Adversary[]
