const CARD_TYPE_VARS: Record<string, string> = {
  Reaction: "--type-reaction",
  Duration: "--type-duration",
  Action: "--type-action",
  Treasure: "--type-treasure",
  Attack: "--type-attack",
  Victory: "--type-victory",
};

export function getTypeColorVar(type: string): string | null {
  return CARD_TYPE_VARS[type] ?? null;
}
