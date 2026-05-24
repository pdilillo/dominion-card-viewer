"use client";

import type { SavedKingdomSet } from "@/lib/types";

type Props = {
  savedSets: SavedKingdomSet[];
  activeId: string | null;
  onLoad: (set: SavedKingdomSet) => void;
  onDelete: (id: string) => void;
};

export function SavedKingdomsPanel({
  savedSets,
  activeId,
  onLoad,
  onDelete,
}: Props) {
  if (savedSets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
        No saved kingdoms yet. Randomize a set and save one you like.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {savedSets.map((set) => {
        const active = set.id === activeId;
        const date = new Date(set.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return (
          <li
            key={set.id}
            className={`rounded-lg border p-3 transition ${
              active
                ? "border-[var(--accent)] bg-[var(--accent)]/10"
                : "border-[var(--border)] bg-[var(--bg)]"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={() => onLoad(set)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-medium text-[var(--text)]">
                  {set.name}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {set.cardIds.length} cards · {date}
                </p>
              </button>
              <button
                type="button"
                onClick={() => onDelete(set.id)}
                className="shrink-0 text-xs text-[var(--danger)] hover:underline"
                aria-label={`Delete ${set.name}`}
              >
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
