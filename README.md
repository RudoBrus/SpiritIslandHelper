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
