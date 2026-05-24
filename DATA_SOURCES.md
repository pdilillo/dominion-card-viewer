# Data Sources

This project merges card metadata from community-maintained datasets. Card text and artwork are property of Rio Grande Games.

## dominiontabs

- **Repository:** [sumpfork/dominiontabs](https://github.com/sumpfork/dominiontabs)
- **Files used:** `card_db_src/cards_db.json`, `card_db_src/sets_db.json`
- **Purpose:** Authoritative card-to-set mappings, including first edition, second edition, removed, and upgrade set distinctions.

## Dominionizer

- **Repository:** [GagaMen/dominionizer](https://github.com/GagaMen/dominionizer)
- **Files used:** `src/data/cards.json`, `src/data/card-types.json`, `src/assets/card_art/*.jpg`
- **License:** GNU Affero General Public License v3
- **Purpose:** Card descriptions, type labels, wiki URLs, and bundled card art thumbnails.

Dominionizer notes that Dominion card text and images are used with permission from Rio Grande Games for non-commercial purposes. Do not reuse art or card text commercially without separate permission from Rio Grande Games.

## Rio Grande Games

Dominion and all official expansions are published by [Rio Grande Games](https://www.riograndegames.com/). Donald X. Vaccarino is the designer.

## Dominion Strategy Wiki

The [Dominion Strategy Wiki](https://wiki.dominionstrategy.com/) is the community reference for individual card pages. This app links to wiki URLs where available but does not scrape the wiki at runtime.

## Updating data

```bash
npm run build:catalog   # refresh JSON from upstream GitHub sources
npm run sync:art        # sync card art from Dominionizer (requires git)
FORCE_SYNC=1 npm run sync:art  # force re-sync even if art exists
```
