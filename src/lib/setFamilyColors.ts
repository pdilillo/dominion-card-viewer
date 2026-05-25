import type { CSSProperties } from "react";

/** Box/header colors derived from each expansion's card art. */
const FAMILY_COLORS: Record<string, string> = {
  Adventures: "#897856",
  Alchemy: "#716c71",
  Allies: "#434342",
  Animals: "#7a6a52",
  Base: "#026a96",
  Cornucopia: "#cf8d1b",
  "Cornucopia and Guilds": "#9a8450",
  "Dark Ages": "#8a6a58",
  Dominion: "#026a96",
  Empires: "#90816f",
  Guilds: "#9a9088",
  "Guilds-bigbox2-de": "#9a9088",
  Hinterlands: "#ac6348",
  Intrigue: "#41584a",
  Menagerie: "#8f7f58",
  Nocturne: "#213f51",
  Plunder: "#fb923c",
  Promo: "#6393db",
  "Promo-bigbox2-de": "#6393db",
  Prosperity: "#a888a8",
  Renaissance: "#b86558",
  "Rising Sun": "#b53a3a",
  Seaside: "#935845",
};

export function getFamilyColor(family: string): string | null {
  return FAMILY_COLORS[family] ?? null;
}

export function familyColorStyle(family: string): CSSProperties | undefined {
  const color = getFamilyColor(family);
  return color ? ({ "--family-color": color } as CSSProperties) : undefined;
}
