"use client";

import type { DominionCard } from "@/lib/types";
import { editionLabel, formatCost, uniqueEditionsForCard } from "@/lib/catalog";
import Image from "next/image";

type Props = {
  card: DominionCard;
  tileWidth: number;
  onClick: () => void;
};

export function CardTile({ card, tileWidth, onClick }: Props) {
  const editions = uniqueEditionsForCard(card);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-left transition hover:border-[var(--accent)] hover:shadow-lg hover:shadow-black/20"
      style={{ width: tileWidth }}
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
      </div>
      <div className="space-y-1 p-2">
        <p className="truncate text-xs font-medium leading-tight">{card.name}</p>
        <div className="flex flex-wrap items-center gap-1">
          <span className="rounded bg-[var(--bg)] px-1.5 py-0.5 text-[10px] tabular-nums text-[var(--accent)]">
            {formatCost(card)}
          </span>
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
}
