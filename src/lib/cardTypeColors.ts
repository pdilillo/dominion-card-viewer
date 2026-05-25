import type { CSSProperties } from "react";

const CARD_TYPE_VARS: Record<string, string> = {
  Reaction: "--type-reaction",
  Duration: "--type-duration",
  Action: "--type-action",
  Treasure: "--type-treasure",
  Attack: "--type-attack",
  Victory: "--type-victory",
};

const BORDER_TYPE_PRIORITY = [
  "Attack",
  "Duration",
  "Reaction",
  "Treasure",
  "Victory",
  "Action",
] as const;

type BorderType = (typeof BORDER_TYPE_PRIORITY)[number];

export function getTypeColorVar(type: string): string | null {
  return CARD_TYPE_VARS[type] ?? null;
}

export function getCardBorderTypes(types: string[]): BorderType[] {
  return BORDER_TYPE_PRIORITY.filter((type) => types.includes(type));
}

export function hasCardTypeBorder(types: string[]): boolean {
  return getCardBorderTypes(types).length > 0;
}

function borderGradientFromVars(colorVars: string[]): string {
  if (colorVars.length === 2) {
    return `linear-gradient(to right, var(${colorVars[0]}) 50%, var(${colorVars[1]}) 50%)`;
  }

  const segment = 360 / colorVars.length;
  const stops = colorVars
    .map((v, i) => `var(${v}) ${i * segment}deg ${(i + 1) * segment}deg`)
    .join(", ");

  return `conic-gradient(from -90deg, ${stops})`;
}

export function getCardBorderGradient(types: string[]): string | null {
  const borderTypes = getCardBorderTypes(types);
  if (borderTypes.length < 2) return null;

  const colorVars = borderTypes
    .map((type) => getTypeColorVar(type))
    .filter((v): v is string => v !== null);

  if (colorVars.length < 2) return null;

  return borderGradientFromVars(colorVars);
}

export function cardBorderStyle(types: string[]): CSSProperties | undefined {
  const borderTypes = getCardBorderTypes(types);
  if (borderTypes.length !== 1) return undefined;

  const colorVar = getTypeColorVar(borderTypes[0]);
  return colorVar ? ({ borderColor: `var(${colorVar})` } as CSSProperties) : undefined;
}
