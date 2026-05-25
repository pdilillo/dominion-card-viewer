"use client";

import type { SortField } from "@/lib/types";
import { TypeBadge } from "./TypeBadge";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortField;
  onSortChange: (value: SortField) => void;
  allTypes: string[];
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
  kingdomOnly: boolean;
  onKingdomOnlyChange: (value: boolean) => void;
  gridZoom: number;
  onGridZoomChange: (value: number) => void;
  resultCount: number;
  compact?: boolean;
  onOpenFilters?: () => void;
  hasActiveFilters?: boolean;
};

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "name", label: "Name (A–Z)" },
  { value: "cost-asc", label: "Cost (low → high)" },
  { value: "cost-desc", label: "Cost (high → low)" },
  { value: "set", label: "Set" },
  { value: "type", label: "Type" },
];

export function FilterBar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  allTypes,
  selectedTypes,
  onTypeToggle,
  kingdomOnly,
  onKingdomOnlyChange,
  gridZoom,
  onGridZoomChange,
  resultCount,
  compact = false,
  onOpenFilters,
  hasActiveFilters = false,
}: Props) {
  const secondaryFilters = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-[var(--muted)]">Types:</span>
        {allTypes.map((type) => (
          <TypeBadge
            key={type}
            type={type}
            active={selectedTypes.includes(type)}
            onClick={() => onTypeToggle(type)}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs text-[var(--muted)]">Grid zoom</label>
        <input
          type="range"
          min={80}
          max={220}
          value={gridZoom}
          onChange={(e) => onGridZoomChange(Number(e.target.value))}
          className="w-40"
        />
        <span className="text-xs tabular-nums text-[var(--muted)]">{gridZoom}px</span>
      </div>
    </>
  );

  return (
    <div className="space-y-3 border-b border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex flex-wrap items-center gap-3">
        {compact && onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            className="relative rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)] transition hover:border-[var(--accent-dim)]"
          >
            Filters
            {hasActiveFilters && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
            )}
          </button>
        )}
        <input
          type="search"
          placeholder="Search cards…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="min-w-[140px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortField)}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={kingdomOnly}
            onChange={(e) => onKingdomOnlyChange(e.target.checked)}
            className="rounded border-[var(--border)]"
          />
          Kingdom only
        </label>
        <span className="text-sm tabular-nums text-[var(--muted)]">
          {resultCount} cards
        </span>
      </div>

      {compact ? (
        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-[var(--muted)] marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-1">
              More filters
              <span className="text-[var(--border)] group-open:rotate-90 transition-transform">
                ›
              </span>
            </span>
          </summary>
          <div className="mt-3 space-y-3">{secondaryFilters}</div>
        </details>
      ) : (
        secondaryFilters
      )}
    </div>
  );
}
