import type {
  CatalogData,
  CatalogFilters,
  DominionCard,
  Edition,
  SetFamily,
  SortField,
} from "./types";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cardMatchesEdition(card: DominionCard, editions: Edition[]): boolean {
  if (editions.length === 0) return true;
  return card.sets.some((s) => editions.includes(s.edition));
}

function cardMatchesSet(card: DominionCard, setIds: string[], families: string[]): boolean {
  if (setIds.length === 0 && families.length === 0) return true;
  if (setIds.length > 0) {
    return card.sets.some((s) => setIds.includes(s.setId));
  }
  return card.sets.some((s) => families.includes(s.family));
}

function cardMatchesTypes(card: DominionCard, types: string[]): boolean {
  if (types.length === 0) return true;
  return types.some((t) => card.types.includes(t));
}

export function filterCards(cards: DominionCard[], filters: CatalogFilters): DominionCard[] {
  const search = filters.search?.trim().toLowerCase();
  const setIds = filters.setIds ?? [];
  const families = filters.families ?? [];
  const editions = filters.editions ?? [];
  const types = filters.types ?? [];

  return cards.filter((card) => {
    if (search && !card.name.toLowerCase().includes(search)) return false;
    if (filters.kingdomOnly && !card.isKingdomCard) return false;
    if (!cardMatchesEdition(card, editions)) return false;
    if (!cardMatchesSet(card, setIds, families)) return false;
    if (!cardMatchesTypes(card, types)) return false;
    return true;
  });
}

function costSortKey(card: DominionCard): [number, number, string] {
  const coins = card.cost ?? -1;
  const potion = card.potionCost ? 1 : 0;
  return [coins, potion, card.name.toLowerCase()];
}

function primarySetName(card: DominionCard): string {
  if (card.sets.length === 0) return "";
  return card.sets[0].setName.toLowerCase();
}

function primaryType(card: DominionCard): string {
  return card.types[0]?.toLowerCase() ?? "";
}

export function sortCards(cards: DominionCard[], sort: SortField): DominionCard[] {
  const sorted = [...cards];
  switch (sort) {
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "cost-asc":
      sorted.sort((a, b) => {
        const ka = costSortKey(a);
        const kb = costSortKey(b);
        return ka[0] - kb[0] || ka[1] - kb[1] || ka[2].localeCompare(kb[2]);
      });
      break;
    case "cost-desc":
      sorted.sort((a, b) => {
        const ka = costSortKey(a);
        const kb = costSortKey(b);
        return kb[0] - ka[0] || kb[1] - ka[1] || ka[2].localeCompare(kb[2]);
      });
      break;
    case "set":
      sorted.sort(
        (a, b) =>
          primarySetName(a).localeCompare(primarySetName(b)) ||
          a.name.localeCompare(b.name),
      );
      break;
    case "type":
      sorted.sort(
        (a, b) =>
          primaryType(a).localeCompare(primaryType(b)) ||
          a.name.localeCompare(b.name),
      );
      break;
  }
  return sorted;
}

export function formatCost(card: DominionCard): string {
  const parts: string[] = [];
  if (card.cost !== null && card.cost >= 0) {
    parts.push(`$${card.cost}`);
  }
  if (card.potionCost) {
    parts.push("P");
  }
  if (parts.length === 0) return "$0";
  return parts.join(" ");
}

export function editionLabel(edition: Edition): string {
  switch (edition) {
    case "1":
      return "1E";
    case "2":
      return "2E";
    case "removed":
      return "Removed";
    case "upgrade":
      return "Upgrade";
    case "latest":
      return "Latest";
  }
}

export function uniqueEditionsForCard(card: DominionCard): Edition[] {
  const seen = new Set<Edition>();
  for (const s of card.sets) {
    seen.add(s.edition);
  }
  return [...seen];
}

export function buildFamiliesFromIndex(
  setsIndex: CatalogData["setsIndex"],
): SetFamily[] {
  const byFamily = new Map<string, SetFamily>();
  for (const entry of setsIndex) {
    let family = byFamily.get(entry.family);
    if (!family) {
      family = { family: entry.family, sets: [] };
      byFamily.set(entry.family, family);
    }
    family.sets.push(entry);
  }
  return [...byFamily.values()].sort((a, b) => a.family.localeCompare(b.family));
}

export { slugify };
