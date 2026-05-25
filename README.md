# Dominion Card Viewer

A visual browser for every Dominion card, with filtering by expansion, edition (1E / 2E / removed), cost, type, and kingdom status.

## Features

- Browse all cards in a zoomable grid (adjust tile size with the slider)
- Click any card for a detail view with pan/zoom on the artwork
- Filter by expansion family, specific set, edition, card type, and kingdom status
- Sort by name, cost, set, or type

## Setup

```bash
npm install
npm run sync:art    # download ~792 card art JPGs (one-time, requires git)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build:catalog` | Rebuild `src/data/catalog.json` from upstream sources |
| `npm run sync:art` | Sync card art into `public/card-art/` |
| `npm run build` | Build catalog + production Next.js bundle |

See [DATA_SOURCES.md](./DATA_SOURCES.md) for attribution and data provenance.

## Deployment

The app is deployed to GitHub Pages at [https://pdilillo.github.io/dominion-card-viewer/](https://pdilillo.github.io/dominion-card-viewer/).

Pushes to `main` trigger the GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds a static export and publishes the `out/` directory.

### One-time GitHub setup

In the repo **Settings → Pages → Build and deployment**, set the source to **GitHub Actions**.

### Local production preview

```bash
GITHUB_PAGES=true npm run build
npx serve out
```

Open [http://localhost:3000/dominion-card-viewer/](http://localhost:3000/dominion-card-viewer/).
