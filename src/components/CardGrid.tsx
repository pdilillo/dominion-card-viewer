"use client";

import type { DominionCard } from "@/lib/types";
import { CardTile } from "./CardTile";

type Props = {
  cards: DominionCard[];
  gridZoom: number;
  onCardClick: (card: DominionCard) => void;
};

export function CardGrid({ cards, gridZoom, onCardClick }: Props) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-[var(--muted)]">
        No cards match your filters.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div
        className="flex flex-wrap gap-3"
        style={{ justifyContent: "flex-start" }}
      >
        {cards.map((card) => (
          <CardTile
            key={card.id}
            card={card}
            tileWidth={gridZoom}
            onClick={() => onCardClick(card)}
          />
        ))}
      </div>
    </div>
  );
}
