"use client";

import type { SetFamily } from "@/lib/types";
import { editionLabel } from "@/lib/catalog";

type Props = {
  families: SetFamily[];
  selectedSetIds: string[];
  selectedFamilies: string[];
  selectedEditions: import("@/lib/types").Edition[];
  onSetToggle: (setId: string) => void;
  onFamilyToggle: (family: string) => void;
  onEditionToggle: (edition: import("@/lib/types").Edition) => void;
  onClearSets: () => void;
};

const EDITION_OPTIONS: import("@/lib/types").Edition[] = [
  "1",
  "2",
  "removed",
  "upgrade",
];

export function SetSidebar({
  families,
  selectedSetIds,
  selectedFamilies,
  selectedEditions,
  onSetToggle,
  onFamilyToggle,
  onEditionToggle,
  onClearSets,
}: Props) {
  const hasSelection =
    selectedSetIds.length > 0 ||
    selectedFamilies.length > 0 ||
    selectedEditions.length > 0;

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
          Filters
        </h2>
      </div>

      <div className="border-b border-[var(--border)] p-4">
        <p className="mb-2 text-xs font-medium text-[var(--muted)]">Edition</p>
        <div className="flex flex-wrap gap-2">
          {EDITION_OPTIONS.map((edition) => {
            const active = selectedEditions.includes(edition);
            return (
              <button
                key={edition}
                type="button"
                onClick={() => onEditionToggle(edition)}
                className={`rounded-full border px-2.5 py-1 text-xs transition ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent-dim)]"
                }`}
              >
                {editionLabel(edition)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2">
        <p className="text-xs font-medium text-[var(--muted)]">Sets</p>
        {hasSelection && (
          <button
            type="button"
            onClick={onClearSets}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {families.map(({ family, sets }) => {
          const familyActive = selectedFamilies.includes(family);
          return (
            <div key={family} className="mb-3">
              <button
                type="button"
                onClick={() => onFamilyToggle(family)}
                className={`mb-1 w-full rounded-lg px-2 py-1.5 text-left text-sm font-medium transition ${
                  familyActive
                    ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                    : "text-[var(--text)] hover:bg-[var(--surface-2)]"
                }`}
              >
                {family}
              </button>
              <ul className="ml-2 space-y-0.5 border-l border-[var(--border)] pl-2">
                {sets.map((set) => {
                  const active = selectedSetIds.includes(set.setId);
                  return (
                    <li key={set.setId}>
                      <button
                        type="button"
                        onClick={() => onSetToggle(set.setId)}
                        className={`flex w-full items-center justify-between rounded px-2 py-1 text-left text-xs transition ${
                          active
                            ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                            : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                        }`}
                      >
                        <span className="truncate">{set.setName}</span>
                        <span className="ml-1 shrink-0 tabular-nums opacity-70">
                          {set.cardCount}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
