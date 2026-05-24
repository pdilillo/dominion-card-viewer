"use client";

import type { AttackPreference, SetFamily } from "@/lib/types";

type Props = {
  families: SetFamily[];
  selectedFamilies: string[];
  selectedSetIds: string[];
  attackPreference: AttackPreference;
  poolCount: number;
  onFamilyToggle: (family: string) => void;
  onAttackPreferenceChange: (value: AttackPreference) => void;
  onClearSets: () => void;
};

const ATTACK_OPTIONS: { value: AttackPreference; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "require", label: "With attacks" },
  { value: "exclude", label: "No attacks" },
];

export function RandomizerFilterBar({
  families,
  selectedFamilies,
  selectedSetIds,
  attackPreference,
  poolCount,
  onFamilyToggle,
  onAttackPreferenceChange,
  onClearSets,
}: Props) {
  const hasSetSelection =
    selectedFamilies.length > 0 || selectedSetIds.length > 0;

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-[var(--muted)]">
            Pull from expansions
          </p>
          {hasSetSelection && (
            <button
              type="button"
              onClick={onClearSets}
              className="text-xs text-[var(--accent)] hover:underline"
            >
              Clear sets
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {families.map(({ family }) => {
            const active = selectedFamilies.includes(family);
            return (
              <button
                key={family}
                type="button"
                onClick={() => onFamilyToggle(family)}
                className={`rounded-full border px-2.5 py-1 text-xs transition ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent-dim)] hover:text-[var(--text)]"
                }`}
              >
                {family}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {hasSetSelection
            ? `${selectedFamilies.length} expansion${selectedFamilies.length === 1 ? "" : "s"}${selectedSetIds.length > 0 ? ` · ${selectedSetIds.length} specific set${selectedSetIds.length === 1 ? "" : "s"}` : ""} · ${poolCount} cards in pool`
            : `All expansions · ${poolCount} cards in pool`}
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-[var(--muted)]">Attacks</p>
        <div className="flex flex-wrap gap-2">
          {ATTACK_OPTIONS.map((option) => {
            const active = attackPreference === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onAttackPreferenceChange(option.value)}
                className={`rounded-full border px-2.5 py-1 text-xs transition ${
                  active
                    ? option.value === "require"
                      ? "border-[var(--type-attack)] bg-[color-mix(in_srgb,var(--type-attack)_20%,transparent)] text-[var(--type-attack)]"
                      : "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent-dim)] hover:text-[var(--text)]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
