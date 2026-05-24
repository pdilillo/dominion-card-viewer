"use client";

import { useEffect } from "react";
import type { DominionCard } from "@/lib/types";
import { editionLabel, formatCost } from "@/lib/catalog";
import { CardDescription } from "./CardDescription";
import { TypeBadge } from "./TypeBadge";
import { ZoomableImage } from "./ZoomableImage";

type Props = {
  card: DominionCard;
  cards: DominionCard[];
  onClose: () => void;
  onNavigate: (card: DominionCard) => void;
};

export function CardDetailModal({ card, cards, onClose, onNavigate }: Props) {
  const index = cards.findIndex((c) => c.id === card.id);
  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < cards.length - 1;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(cards[index - 1]);
      if (e.key === "ArrowRight" && hasNext) onNavigate(cards[index + 1]);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cards, index, hasPrev, hasNext, onClose, onNavigate]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={card.name}
    >
      <div
        className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-h-[280px] flex-1 items-center justify-center bg-[var(--bg)] p-4">
          <ZoomableImage src={card.image} alt={card.name} />
        </div>

        <div className="flex w-full flex-col border-t border-[var(--border)] lg:w-80 lg:border-l lg:border-t-0">
          <div className="flex items-start justify-between border-b border-[var(--border)] p-4">
            <div>
              <h2 className="text-lg font-bold">{card.name}</h2>
              <p className="mt-1 text-sm text-[var(--accent)]">{formatCost(card)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1">
                {card.types.map((type) => (
                  <TypeBadge key={type} type={type} size="xs" />
                ))}
                {card.isKingdomCard && (
                  <span className="rounded-full border border-[var(--border)] px-1 py-0.5 text-[9px] text-[var(--muted)]">
                    Kingdom
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {card.description && (
              <CardDescription description={card.description} className="mb-4" />
            )}

            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Sets
            </h3>
            <ul className="mb-4 space-y-1">
              {card.sets.map((s) => (
                <li
                  key={`${s.setId}-${s.edition}`}
                  className="flex items-center justify-between text-xs"
                >
                  <span>{s.setName}</span>
                  <span className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[var(--muted)]">
                    {editionLabel(s.edition)}
                  </span>
                </li>
              ))}
            </ul>

            {card.wikiUrl && (
              <a
                href={card.wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--accent)] hover:underline"
              >
                View on Dominion Strategy Wiki →
              </a>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] p-3">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={() => hasPrev && onNavigate(cards[index - 1])}
              className="rounded-lg px-3 py-1.5 text-sm disabled:opacity-30 hover:bg-[var(--surface-2)]"
            >
              ← Prev
            </button>
            <span className="text-xs text-[var(--muted)]">
              {index + 1} / {cards.length}
            </span>
            <button
              type="button"
              disabled={!hasNext}
              onClick={() => hasNext && onNavigate(cards[index + 1])}
              className="rounded-lg px-3 py-1.5 text-sm disabled:opacity-30 hover:bg-[var(--surface-2)]"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
