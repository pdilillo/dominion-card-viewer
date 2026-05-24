import { filterCards } from "./catalog";
import type { CatalogFilters, DominionCard } from "./types";

export const KINGDOM_SIZE = 10;

export type CostBucket = "2" | "3" | "4" | "5" | "6+";

const BUCKET_ORDER: CostBucket[] = ["2", "3", "4", "5", "6+"];

/** Target picks per cost bucket for a moderate $2–$6+ spread (2 × 5 = 10). */
const TARGET_PER_BUCKET = 2;

export function getCostBucket(card: DominionCard): CostBucket | null {
  if (card.cost === null) return null;
  if (card.cost <= 2) return "2";
  if (card.cost === 3) return "3";
  if (card.cost === 4) return "4";
  if (card.cost === 5) return "5";
  return "6+";
}

export function getEligibleKingdomPool(
  cards: DominionCard[],
  filters: CatalogFilters,
): DominionCard[] {
  return filterCards(cards, { ...filters, kingdomOnly: true }).filter(
    (card) => card.cost !== null,
  );
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

function groupByBucket(cards: DominionCard[]): Map<CostBucket, DominionCard[]> {
  const byBucket = new Map<CostBucket, DominionCard[]>();
  for (const bucket of BUCKET_ORDER) {
    byBucket.set(bucket, []);
  }
  for (const card of cards) {
    const bucket = getCostBucket(card);
    if (bucket) byBucket.get(bucket)!.push(card);
  }
  return byBucket;
}

function countByBucket(cards: DominionCard[]): Map<CostBucket, number> {
  const counts = new Map<CostBucket, number>();
  for (const bucket of BUCKET_ORDER) counts.set(bucket, 0);
  for (const card of cards) {
    const bucket = getCostBucket(card);
    if (bucket) counts.set(bucket, counts.get(bucket)! + 1);
  }
  return counts;
}

export type RandomizeOptions = {
  count?: number;
  lockedIds?: string[];
};

/**
 * Picks kingdom cards with a moderate cost spread across $2–$6+, modeled after
 * stratified randomizer approaches used in the Dominion community.
 */
export function randomizeKingdom(
  pool: DominionCard[],
  options: RandomizeOptions = {},
): DominionCard[] {
  const count = options.count ?? KINGDOM_SIZE;
  const lockedIds = new Set(options.lockedIds ?? []);

  const locked = pool.filter((card) => lockedIds.has(card.id));
  const available = pool.filter((card) => !lockedIds.has(card.id));

  const selected: DominionCard[] = [...locked];
  const selectedIds = new Set(selected.map((card) => card.id));
  const bucketCounts = countByBucket(selected);
  const byBucket = groupByBucket(available);

  function addCard(card: DominionCard) {
    selected.push(card);
    selectedIds.add(card.id);
    const bucket = getCostBucket(card);
    if (bucket) bucketCounts.set(bucket, bucketCounts.get(bucket)! + 1);
  }

  for (const bucket of BUCKET_ORDER) {
    const need = Math.max(0, TARGET_PER_BUCKET - bucketCounts.get(bucket)!);
    const candidates = shuffle(byBucket.get(bucket)!.filter((c) => !selectedIds.has(c.id)));
    for (let i = 0; i < need && selected.length < count && i < candidates.length; i++) {
      addCard(candidates[i]);
    }
  }

  while (selected.length < count) {
    const underfilled = BUCKET_ORDER.filter((bucket) => {
      const remaining = byBucket
        .get(bucket)!
        .filter((card) => !selectedIds.has(card.id));
      return bucketCounts.get(bucket)! < TARGET_PER_BUCKET && remaining.length > 0;
    });

    const remainingPool =
      underfilled.length > 0
        ? underfilled.flatMap((bucket) =>
            byBucket.get(bucket)!.filter((card) => !selectedIds.has(card.id)),
          )
        : available.filter((card) => !selectedIds.has(card.id));

    const card = pickRandom(remainingPool);
    if (!card) break;
    addCard(card);
  }

  return selected.slice(0, count);
}

export function summarizeCostSpread(cards: DominionCard[]): Record<CostBucket, number> {
  const summary: Record<CostBucket, number> = { "2": 0, "3": 0, "4": 0, "5": 0, "6+": 0 };
  for (const card of cards) {
    const bucket = getCostBucket(card);
    if (bucket) summary[bucket]++;
  }
  return summary;
}

export function resolveCardsById(
  cards: DominionCard[],
  ids: string[],
): DominionCard[] {
  const byId = new Map(cards.map((card) => [card.id, card]));
  return ids.map((id) => byId.get(id)).filter((card): card is DominionCard => !!card);
}
