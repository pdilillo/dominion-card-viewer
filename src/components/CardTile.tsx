"use client";

import type { DominionCard } from "@/lib/types";
import { editionLabel, formatCost, uniqueEditionsForCard } from "@/lib/catalog";
import { cardBorderStyle, getCardBorderGradient, hasCardTypeBorder } from "@/lib/cardTypeColors";
import Image from "next/image";
import { CardNameOverlay } from "./CardNameOverlay";
import { TypeBadge } from "./TypeBadge";

type Props = {
  card: DominionCard;
  tileWidth: number;
  onClick: () => void;
};

export function CardTile({ card, tileWidth, onClick }: Props) {
  const editions = uniqueEditionsForCard(card);
  const borderGradient = getCardBorderGradient(card.types);
  const hasTypeBorder = hasCardTypeBorder(card.types);

  const tile = (
    <button
      type="button"
      onClick={onClick}
      style={borderGradient ? undefined : { width: tileWidth, ...cardBorderStyle(card.types) }}
      className={`group flex flex-col overflow-hidden bg-[var(--surface-2)] text-left transition hover:shadow-lg hover:shadow-black/20 ${
        borderGradient
          ? "h-full w-full rounded-[5px]"
          : `rounded-lg border-[3px] ${
              hasTypeBorder
                ? "hover:brightness-110"
                : "border-[var(--border)] hover:border-[var(--accent)]"
            }`
      }`}
    >
      <div
        className="relative w-full overflow-hidden bg-[var(--bg)]"
        style={{ aspectRatio: "2.5 / 3.5" }}
      >
        <Image
          src={card.image}
          alt={card.name}
          fill
          sizes={`${tileWidth}px`}
          className="object-contain p-1 transition group-hover:scale-105"
          unoptimized
        />
        <CardNameOverlay name={card.name} />
      </div>
      <div className="space-y-1 p-2">
        <p className="truncate text-xs font-medium leading-tight">{card.name}</p>
        <div className="flex flex-wrap items-center gap-1">
          <span className="rounded bg-[var(--bg)] px-1.5 py-0.5 text-[10px] tabular-nums text-[var(--accent)]">
            {formatCost(card)}
          </span>
          {card.types.map((type) => (
            <TypeBadge key={type} type={type} size="xs" />
          ))}
          {editions.slice(0, 2).map((e) => (
            <span
              key={e}
              className="rounded border border-[var(--border)] px-1 py-0.5 text-[9px] text-[var(--muted)]"
            >
              {editionLabel(e)}
            </span>
          ))}
        </div>
      </div>
    </button>
  );

  if (borderGradient) {
    return (
      <div
        className="rounded-lg p-[3px] transition hover:shadow-lg hover:shadow-black/20 hover:brightness-110"
        style={{ width: tileWidth, background: borderGradient }}
      >
        {tile}
      </div>
    );
  }

  return tile;
}
