"use client";

import type { CSSProperties } from "react";
import { editionLabel, familyHasDualEditions, getFamilyExtraLabel } from "@/lib/catalog";
import { familyColorStyle, getFamilyColor } from "@/lib/setFamilyColors";
import type { Edition, SetFamily } from "@/lib/types";

type Props = {
  families: SetFamily[];
  selectedSetIds: string[];
  selectedFamilies: string[];
  selectedEditions?: Edition[];
  familyEditions?: Partial<Record<string, "1" | "2">>;
  editionMode?: "global" | "per-family";
  onSetToggle: (setId: string) => void;
  onFamilyToggle: (family: string) => void;
  onEditionToggle?: (edition: Edition) => void;
  onFamilyEditionChange?: (family: string, edition: "1" | "2" | undefined) => void;
  onClearSets: () => void;
  title?: string;
  setsSectionLabel?: string;
  className?: string;
  hideHeader?: boolean;
};

const EDITION_OPTIONS: Edition[] = ["1", "2", "removed", "upgrade"];

const PER_FAMILY_EDITION_OPTIONS = [
  { value: undefined, label: "All" },
  { value: "1" as const, label: "1E" },
  { value: "2" as const, label: "2E" },
];

export function SetSidebar({
  families,
  selectedSetIds,
  selectedFamilies,
  selectedEditions = [],
  familyEditions = {},
  editionMode = "global",
  onSetToggle,
  onFamilyToggle,
  onEditionToggle,
  onFamilyEditionChange,
  onClearSets,
  title = "Filters",
  setsSectionLabel = "Sets",
  className = "w-72 shrink-0 border-r",
  hideHeader = false,
}: Props) {
  const hasFamilyEditionSelection = Object.keys(familyEditions).length > 0;
  const hasSelection =
    selectedSetIds.length > 0 ||
    selectedFamilies.length > 0 ||
    selectedEditions.length > 0 ||
    hasFamilyEditionSelection;

  return (
    <aside
      className={`flex h-full flex-col border-[var(--border)] bg-[var(--surface)] ${className}`}
    >
      {!hideHeader && (
        <div className="border-b border-[var(--border)] p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            {title}
          </h2>
        </div>
      )}

      {editionMode === "global" && onEditionToggle && (
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
      )}

      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2">
        <p className="text-xs font-medium text-[var(--muted)]">{setsSectionLabel}</p>
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
          const familyColor = getFamilyColor(family);
          const familyExtraLabel = getFamilyExtraLabel(family);
          const showEditionPicker =
            editionMode === "per-family" &&
            onFamilyEditionChange &&
            familyHasDualEditions(sets, family);
          return (
            <div key={family} className="mb-3">
              <button
                type="button"
                onClick={() => onFamilyToggle(family)}
                style={familyColorStyle(family)}
                className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-medium transition ${
                  familyActive
                    ? familyColor
                      ? "bg-[color-mix(in_srgb,var(--family-color)_18%,transparent)] text-[color:var(--family-color)]"
                      : "bg-[var(--accent)]/15 text-[var(--accent)]"
                    : familyColor
                      ? "text-[color:var(--family-color)] hover:bg-[color-mix(in_srgb,var(--family-color)_10%,transparent)]"
                      : "text-[var(--text)] hover:bg-[var(--surface-2)]"
                }`}
              >
                {familyColor && (
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: familyColor }}
                    aria-hidden
                  />
                )}
                {family}
                {familyExtraLabel && (
                  <span className="font-normal opacity-70">· {familyExtraLabel}</span>
                )}
              </button>
              {showEditionPicker && (
                <div className="mb-1 ml-2 flex flex-wrap gap-1">
                  {PER_FAMILY_EDITION_OPTIONS.map(({ value, label }) => {
                    const active = familyEditions[family] === value;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => onFamilyEditionChange(family, value)}
                        className={`rounded-full border px-2 py-0.5 text-[10px] transition ${
                          active
                            ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                            : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent-dim)]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
              <ul
                className="ml-2 space-y-0.5 border-l pl-2"
                style={
                  familyColor
                    ? ({ borderColor: `color-mix(in srgb, ${familyColor} 35%, var(--border))` } as CSSProperties)
                    : undefined
                }
              >
                {sets.map((set) => {
                  const active = selectedSetIds.includes(set.setId);
                  return (
                    <li key={set.setId}>
                      <button
                        type="button"
                        onClick={() => onSetToggle(set.setId)}
                        style={familyColorStyle(family)}
                        className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition ${
                          active
                            ? familyColor
                              ? "bg-[color-mix(in_srgb,var(--family-color)_14%,transparent)] text-[color:var(--family-color)]"
                              : "bg-[var(--accent)]/10 text-[var(--accent)]"
                            : familyColor
                              ? "text-[color:var(--family-color)] hover:bg-[color-mix(in_srgb,var(--family-color)_10%,transparent)]"
                              : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                        }`}
                      >
                        {familyColor && (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: familyColor }}
                            aria-hidden
                          />
                        )}
                        <span className="min-w-0 flex-1 truncate">{set.setName}</span>
                        <span className="shrink-0 tabular-nums opacity-70">
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
