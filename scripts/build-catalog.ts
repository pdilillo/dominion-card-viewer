import { mkdir, writeFile } from "fs/promises";
import path from "path";

const DOMINIONTABS_BASE =
  "https://raw.githubusercontent.com/sumpfork/dominiontabs/master/card_db_src";
const DOMINIONIZER_BASE =
  "https://raw.githubusercontent.com/GagaMen/dominionizer/master/src/data";

type TabsCard = {
  card_tag: string;
  cardset_tags: string[];
  cost?: string;
  types?: string[];
  randomizer?: boolean;
};

type TabsSet = {
  edition?: string[];
  short_name?: string;
  set_name?: string;
  removed?: string;
  fan?: boolean;
};

type DominionizerCard = {
  name: string;
  description?: string;
  image?: string;
  wikiUrl?: string;
  expansions?: number[];
  types?: number[];
  isKingdomCard?: boolean;
  cost?: number;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json() as Promise<T>;
}

type Edition = "1" | "2" | "removed" | "upgrade" | "latest";

function resolveEdition(editions: string[] | undefined): Edition {
  const e = editions ?? [];
  if (e.includes("removed")) return "removed";
  if (e.includes("upgrade")) return "upgrade";
  if (e.includes("2")) return "2";
  if (e.includes("1")) return "1";
  if (e.includes("latest")) return "latest";
  return "latest";
}

function humanizeSetId(setId: string): string {
  return setId
    .replace(/1stEdition/g, " (1st Edition)")
    .replace(/2ndEdition/g, " (2nd Edition)")
    .replace(/And/g, " & ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function deriveFamily(setId: string, shortName?: string): string {
  if (shortName) return shortName;
  return setId
    .replace(/1stEdition(Removed|Upgrade)?/g, "")
    .replace(/2ndEdition(Upgrade)?/g, "")
    .replace(/AndGuilds/g, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function deriveSetName(setId: string, shortName?: string, edition?: Edition): string {
  const family = deriveFamily(setId, shortName);
  if (edition === "removed") return `${family} (Removed from 2E)`;
  if (edition === "upgrade") return `${family} (2E Upgrade)`;
  if (edition === "1") return `${family} (1st Edition)`;
  if (edition === "2") return `${family} (2nd Edition)`;
  if (shortName) return shortName;
  return humanizeSetId(setId);
}

function parseTabsCost(cost?: string): { cost: number | null; potionCost: boolean } {
  if (!cost) return { cost: null, potionCost: false };
  const potionCost = cost.includes("*") || cost.toLowerCase().includes("p");
  const numeric = parseInt(cost.replace(/\D/g, ""), 10);
  return {
    cost: Number.isNaN(numeric) ? null : numeric,
    potionCost,
  };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  console.log("Fetching upstream card data…");

  const [tabsCards, tabsSets, dominionizerCards, cardTypes] = await Promise.all([
    fetchJson<TabsCard[]>(`${DOMINIONTABS_BASE}/cards_db.json`),
    fetchJson<Record<string, TabsSet>>(`${DOMINIONTABS_BASE}/sets_db.json`),
    fetchJson<DominionizerCard[]>(`${DOMINIONIZER_BASE}/cards.json`),
    fetchJson<Record<string, string>>(`${DOMINIONIZER_BASE}/card-types.json`),
  ]);

  const dominionizerByName = new Map<string, DominionizerCard>();
  for (const card of dominionizerCards) {
    dominionizerByName.set(card.name, card);
  }

  const setMeta = new Map<
    string,
    { setName: string; family: string; edition: Edition }
  >();

  for (const [setId, meta] of Object.entries(tabsSets)) {
    const edition = resolveEdition(meta.edition);
    const family = deriveFamily(setId, meta.short_name);
    const setName = deriveSetName(setId, meta.short_name, edition);
    setMeta.set(setId, { setName, family, edition });
  }

  type BuiltCard = {
    id: string;
    name: string;
    cost: number | null;
    potionCost: boolean;
    types: string[];
    description: string;
    isKingdomCard: boolean;
    image: string;
    wikiUrl?: string;
    sets: Array<{
      setId: string;
      setName: string;
      edition: Edition;
      family: string;
    }>;
  };
  const cards: BuiltCard[] = [];

  for (const tab of tabsCards) {
    const name = tab.card_tag;
    const dz = dominionizerByName.get(name);
    const tabsCost = parseTabsCost(tab.cost);
    const types =
      tab.types ??
      (dz?.types?.map((id) => cardTypes[String(id)]).filter(Boolean) as string[]) ??
      [];

    const sets = tab.cardset_tags
      .map((setId) => {
        const meta = setMeta.get(setId);
        if (!meta) return null;
        return {
          setId,
          setName: meta.setName,
          edition: meta.edition,
          family: meta.family,
        };
      })
      .filter(Boolean) as BuiltCard["sets"];

    if (sets.length === 0) continue;

    const imageFile = dz?.image ?? `${name.replace(/\s+/g, "_")}Art.jpg`;

    cards.push({
      id: slugify(name),
      name,
      cost: dz?.cost ?? tabsCost.cost,
      potionCost: tabsCost.potionCost,
      types,
      description: dz?.description?.trim() ?? "",
      isKingdomCard: dz?.isKingdomCard ?? tab.randomizer !== false,
      image: `/card-art/${imageFile}`,
      wikiUrl: dz?.wikiUrl,
      sets,
    });
  }

  cards.sort((a, b) => a.name.localeCompare(b.name));

  const setCounts = new Map<string, number>();
  for (const card of cards) {
    for (const s of card.sets) {
      setCounts.set(s.setId, (setCounts.get(s.setId) ?? 0) + 1);
    }
  }

  const setsIndex = [...setMeta.entries()]
    .map(([setId, meta]) => ({
      setId,
      setName: meta.setName,
      family: meta.family,
      edition: meta.edition,
      cardCount: setCounts.get(setId) ?? 0,
    }))
    .filter((s) => s.cardCount > 0)
    .sort((a, b) => a.family.localeCompare(b.family) || a.setName.localeCompare(b.setName));

  const familyMap = new Map<string, typeof setsIndex>();
  for (const entry of setsIndex) {
    const list = familyMap.get(entry.family) ?? [];
    list.push(entry);
    familyMap.set(entry.family, list);
  }

  const families = [...familyMap.entries()]
    .map(([family, sets]) => ({ family, sets }))
    .sort((a, b) => a.family.localeCompare(b.family));

  const allTypes = [...new Set(cards.flatMap((c) => c.types))].sort();

  const outDir = path.join(process.cwd(), "src/data");
  await mkdir(outDir, { recursive: true });

  const catalog = { cards, setsIndex, families, allTypes };
  await writeFile(
    path.join(outDir, "catalog.json"),
    JSON.stringify(catalog, null, 2),
  );
  await writeFile(
    path.join(outDir, "sets-index.json"),
    JSON.stringify(setsIndex, null, 2),
  );

  console.log(`Built catalog: ${cards.length} cards, ${setsIndex.length} sets`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
