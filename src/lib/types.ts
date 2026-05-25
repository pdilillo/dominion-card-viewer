export type Edition = "1" | "2" | "removed" | "upgrade" | "latest";

export type CardSetMembership = {
  setId: string;
  setName: string;
  edition: Edition;
  family: string;
};

export type DominionCard = {
  id: string;
  name: string;
  cost: number | null;
  potionCost: boolean;
  types: string[];
  description: string;
  isKingdomCard: boolean;
  image: string;
  wikiUrl?: string;
  sets: CardSetMembership[];
};

export type SetIndexEntry = {
  setId: string;
  setName: string;
  family: string;
  edition: Edition;
  cardCount: number;
};

export type SetFamily = {
  family: string;
  sets: SetIndexEntry[];
};

export type SortField = "name" | "cost-asc" | "cost-desc" | "set" | "type";

export type CatalogFilters = {
  search?: string;
  setIds?: string[];
  families?: string[];
  editions?: Edition[];
  /** When a family is selected, limit to this edition (1E or 2E). Omit = all editions. */
  familyEditions?: Partial<Record<string, "1" | "2">>;
  types?: string[];
  kingdomOnly?: boolean;
};

export type AttackPreference = "any" | "require" | "exclude";

export type RandomizerPoolFilters = CatalogFilters & {
  attackPreference?: AttackPreference;
};

export type CatalogData = {
  cards: DominionCard[];
  setsIndex: SetIndexEntry[];
  families: SetFamily[];
  allTypes: string[];
};

export type SavedKingdomSet = {
  id: string;
  name: string;
  createdAt: string;
  cardIds: string[];
  poolFilters?: RandomizerPoolFilters;
};
