import type { CatalogFilters, SavedKingdomSet } from "./types";

const STORAGE_KEY = "dominion-card-viewer:saved-kingdoms";

function isSavedKingdomSet(value: unknown): value is SavedKingdomSet {
  if (!value || typeof value !== "object") return false;
  const item = value as SavedKingdomSet;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.createdAt === "string" &&
    Array.isArray(item.cardIds) &&
    item.cardIds.every((id) => typeof id === "string")
  );
}

export function loadSavedKingdoms(): SavedKingdomSet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedKingdomSet);
  } catch {
    return [];
  }
}

function writeSavedKingdoms(sets: SavedKingdomSet[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
}

export function saveKingdomSet(input: {
  name: string;
  cardIds: string[];
  poolFilters?: CatalogFilters;
}): SavedKingdomSet {
  const entry: SavedKingdomSet = {
    id: crypto.randomUUID(),
    name: input.name.trim() || "Untitled kingdom",
    createdAt: new Date().toISOString(),
    cardIds: input.cardIds,
    poolFilters: input.poolFilters,
  };

  const existing = loadSavedKingdoms();
  writeSavedKingdoms([entry, ...existing]);
  return entry;
}

export function deleteSavedKingdom(id: string): void {
  const existing = loadSavedKingdoms();
  writeSavedKingdoms(existing.filter((set) => set.id !== id));
}

export function validateSavedKingdom(
  saved: SavedKingdomSet,
  validCardIds: Set<string>,
): SavedKingdomSet | null {
  const cardIds = saved.cardIds.filter((id) => validCardIds.has(id));
  if (cardIds.length === 0) return null;
  return { ...saved, cardIds };
}
