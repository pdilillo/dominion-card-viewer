import type {
  CatalogData,
  CatalogFilters,
  DominionCard,
  Edition,
  RandomizerPoolFilters,
  SetFamily,
  SetIndexEntry,
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

/** 2E cards for these families live in the Cornucopia & Guilds combined box set. */
const COMBINED_BOX_SET_ID = "cornucopiaAndGuilds2ndEdition";
const FAMILIES_WITH_COMBINED_2E = new Set(["Cornucopia", "Guilds"]);

function cardMatchesFamilyEdition(
  card: DominionCard,
  family: string,
  edition: "1" | "2",
): boolean {
  if (family === "Cornucopia") {
    if (edition === "1") {
      return card.sets.some((s) => s.setId === "cornucopia1stEdition");
    }
    return (
      card.sets.some((s) => s.setId === COMBINED_BOX_SET_ID) &&
      (card.sets.some((s) => s.setId === "cornucopia1stEdition") ||
        card.sets.some((s) => s.setId === "cornucopia2ndEditionUpgrade"))
    );
  }
  if (family === "Guilds") {
    if (edition === "1") {
      return card.sets.some((s) => s.setId === "guilds1stEdition");
    }
    return (
      card.sets.some((s) => s.setId === COMBINED_BOX_SET_ID) &&
      (card.sets.some((s) => s.setId === "guilds1stEdition") ||
        card.sets.some((s) => s.setId === "guilds2ndEditionUpgrade"))
    );
  }
  return card.sets.some((s) => s.family === family && s.edition === edition);
}

function cardMatchesFamilyAnyEdition(card: DominionCard, family: string): boolean {
  if (FAMILIES_WITH_COMBINED_2E.has(family)) {
    return (
      cardMatchesFamilyEdition(card, family, "1") ||
      cardMatchesFamilyEdition(card, family, "2")
    );
  }
  return card.sets.some((s) => s.family === family);
}

function cardMatchesSet(
  card: DominionCard,
  setIds: string[],
  families: string[],
  familyEditions?: Partial<Record<string, "1" | "2">>,
): boolean {
  if (setIds.length === 0 && families.length === 0) return true;
  if (setIds.length > 0) {
    return card.sets.some((s) => setIds.includes(s.setId));
  }
  return families.some((family) => {
    const editionPref = familyEditions?.[family];
    if (!editionPref) {
      return cardMatchesFamilyAnyEdition(card, family);
    }
    return cardMatchesFamilyEdition(card, family, editionPref);
  });
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
  const familyEditions = filters.familyEditions;

  return cards.filter((card) => {
    if (search && !card.name.toLowerCase().includes(search)) return false;
    if (filters.kingdomOnly && !card.isKingdomCard) return false;
    if (!cardMatchesEdition(card, editions)) return false;
    if (!cardMatchesSet(card, setIds, families, familyEditions)) return false;
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

/** Clarifying labels for families whose name alone is ambiguous in the UI. */
const FAMILY_EXTRA_LABELS: Record<string, string> = {
  Base: "Supply Cards",
};

export function getFamilyExtraLabel(family: string): string | undefined {
  return FAMILY_EXTRA_LABELS[family];
}

/** Big-box bundles, combined editions, and non-kingdom supply cards. */
export function isRandomizerSetOption(entry: SetIndexEntry): boolean {
  const id = entry.setId.toLowerCase();
  const family = entry.family.toLowerCase();
  if (family === "base" || id === "base") return false;
  if (id.includes("bigbox") || family.includes("bigbox")) return false;
  if (entry.family.includes(" and ")) return false;
  return true;
}

export function filterFamiliesForRandomizer(families: SetFamily[]): SetFamily[] {
  return families
    .map(({ family, sets }) => ({
      family,
      sets: sets.filter(isRandomizerSetOption),
    }))
    .filter(({ sets }) => sets.length > 0);
}

export function familyHasDualEditions(sets: SetIndexEntry[], family?: string): boolean {
  if (family && FAMILIES_WITH_COMBINED_2E.has(family)) return true;
  const editions = new Set(sets.map((s) => s.edition));
  return editions.has("1") && editions.has("2");
}

export function sanitizeRandomizerPoolFilters(
  filters: RandomizerPoolFilters,
  families: SetFamily[],
): RandomizerPoolFilters {
  const options = filterFamiliesForRandomizer(families);
  const validSetIds = new Set(options.flatMap((f) => f.sets.map((s) => s.setId)));
  const validFamilies = new Set(options.map((f) => f.family));
  const dualEditionFamilies = new Set(
    options.filter((f) => familyHasDualEditions(f.sets, f.family)).map((f) => f.family),
  );
  let familyEditions = Object.fromEntries(
    Object.entries(filters.familyEditions ?? {}).filter(
      ([family, edition]) =>
        validFamilies.has(family) &&
        dualEditionFamilies.has(family) &&
        (edition === "1" || edition === "2"),
    ),
  ) as Partial<Record<string, "1" | "2">>;

  // Migrate legacy global edition filter from older saved kingdoms.
  if (
    Object.keys(familyEditions).length === 0 &&
    filters.editions?.length === 1 &&
    (filters.editions[0] === "1" || filters.editions[0] === "2")
  ) {
    const edition = filters.editions[0];
    for (const family of (filters.families ?? []).filter((f) => validFamilies.has(f))) {
      if (dualEditionFamilies.has(family)) {
        familyEditions[family] = edition;
      }
    }
  }

  return {
    ...filters,
    setIds: (filters.setIds ?? []).filter((id) => validSetIds.has(id)),
    families: (filters.families ?? []).filter((f) => validFamilies.has(f)),
    familyEditions,
  };
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
