# Spirit Island Helper

A static, mobile-friendly helper website built with React, TypeScript, Vite, and Tailwind CSS.

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm
- Git

## Installation

```sh
npm ci
```

## Development

Start the local development server:

```sh
npm run dev
```

Open the local URL printed by Vite in your browser.

## Tests

Run the unit tests once:

```sh
npm test
```

Type-check the test files:

```sh
npm run test:typecheck
```

## Linting

```sh
npm run lint
```

## Production build

```sh
npm run build
```

The static production files are written to `dist/`. To serve that build locally:

```sh
npm run preview
```

## Spirit aspects

After spirits are selected, players can optionally choose a listed aspect from
their spirit's result card. The local data includes aspect names, their
expansion, and whether they change the spirit's complexity; it does not include
aspect card text or artwork. The Spirit Island Wiki's spirit pages provide
aspect references, for example
<https://spiritislandwiki.com/index.php/River_Surges_in_Sunlight#tab=Aspects>.
Each result card also lets its player reroll their spirit independently, while
keeping other players' spirits unchanged and honoring the active complexity
choices.

## Spirit/adversary matchup tiers

Choosing an adversary is optional when drawing spirits. When one is selected,
each spirit shows its matchup tier against that adversary; choosing an aspect
uses the aspect-specific tier when one is listed. Changing the adversary updates
the existing results without rerolling spirits.

The matchup grades and special asterisks are transcribed with the author's
permission from
[Red's Match-up Axis: 5 Star System](https://www.reddit.com/r/spiritisland/comments/1bqer7k/reds_matchup_axis_5_star_system/).
The ratings are the author's assessment for level 6 adversaries, multiplayer
games with 4 or more spirits, no outside support, no scenario, balanced boards,
and optimal play. An asterisk is the author's marker for a matchup that may be
harder to achieve at its listed tier. These ratings are subjective guidance,
not a guarantee of game outcomes.

The **Matchup axis** view displays the complete spirit-and-aspect table. Filter
by adversary, search spirit or aspect names, and narrow by spirit complexity.
On small screens, scroll horizontally to see all adversary columns.

## GitHub Pages

The site is configured for this repository's project URL:
<https://rudobrus.github.io/SpiritIslandHelper/>.

### One-time GitHub setup

1. Push the project to the `main` branch.
2. In the GitHub repository, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open the **Actions** tab and wait for the **Deploy to GitHub Pages**
   workflow to finish. The site URL is also shown in the workflow's deployment
   environment.
5. Open <https://rudobrus.github.io/SpiritIslandHelper/> on your phone.

The workflow in `.github/workflows/deploy.yml` runs the tests, lint, and
production build, then publishes `dist/`. It runs automatically when changes
are pushed to `main`; it can also be started manually from the **Actions** tab.
To publish an update, commit your changes and push them to `main`:

```sh
git add .
git commit -m "Describe your changes"
git push
```
