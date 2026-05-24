"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import catalogData from "@/data/catalog.json";
import { sortCards } from "@/lib/catalog";
import {
  getEligibleKingdomPool,
  KINGDOM_SIZE,
  randomizeKingdom,
  resolveCardsById,
  summarizeCostSpread,
} from "@/lib/randomizer";
import {
  deleteSavedKingdom,
  loadSavedKingdoms,
  saveKingdomSet,
  validateSavedKingdom,
} from "@/lib/storage";
import type { CatalogData, DominionCard, Edition, SavedKingdomSet } from "@/lib/types";
import { AppHeader } from "@/components/AppHeader";
import { CardDetailModal } from "@/components/CardDetailModal";
import { SavedKingdomsPanel } from "@/components/SavedKingdomsPanel";
import { SetSidebar } from "@/components/SetSidebar";

const data = catalogData as CatalogData;
const validCardIds = new Set(data.cards.map((card) => card.id));

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function RandomizerPage() {
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [selectedEditions, setSelectedEditions] = useState<Edition[]>([]);
  const [gridZoom, setGridZoom] = useState(160);
  const [kingdomCards, setKingdomCards] = useState<DominionCard[]>([]);
  const [lockedIds, setLockedIds] = useState<string[]>([]);
  const [selectedCard, setSelectedCard] = useState<DominionCard | null>(null);
  const [savedSets, setSavedSets] = useState<SavedKingdomSet[]>([]);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [saveName, setSaveName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const poolFilters = useMemo(
    () => ({
      setIds: selectedSetIds,
      families: selectedFamilies,
      editions: selectedEditions,
    }),
    [selectedSetIds, selectedFamilies, selectedEditions],
  );

  const eligiblePool = useMemo(
    () => getEligibleKingdomPool(data.cards, poolFilters),
    [poolFilters],
  );

  const costSpread = useMemo(() => summarizeCostSpread(kingdomCards), [kingdomCards]);

  useEffect(() => {
    const loaded = loadSavedKingdoms()
      .map((set) => validateSavedKingdom(set, validCardIds))
      .filter((set): set is SavedKingdomSet => set !== null);
    setSavedSets(loaded);
  }, []);

  const generateKingdom = useCallback(
    (options?: { lockedIds?: string[] }) => {
      setError(null);
      setActiveSavedId(null);

      if (eligiblePool.length < KINGDOM_SIZE) {
        setError(
          `Need at least ${KINGDOM_SIZE} kingdom cards in the pool (currently ${eligiblePool.length}). Try selecting more expansions.`,
        );
        return;
      }

      const next = randomizeKingdom(eligiblePool, {
        lockedIds: options?.lockedIds ?? lockedIds,
      });
      setKingdomCards(sortCards(next, "cost-asc"));
    },
    [eligiblePool, lockedIds],
  );

  function handleLoadSaved(set: SavedKingdomSet) {
    const cards = resolveCardsById(data.cards, set.cardIds);
    setKingdomCards(sortCards(cards, "cost-asc"));
    setLockedIds([]);
    setActiveSavedId(set.id);
    setError(null);
    setShowSaveForm(false);
  }

  function handleDeleteSaved(id: string) {
    deleteSavedKingdom(id);
    setSavedSets((prev) => prev.filter((set) => set.id !== id));
    if (activeSavedId === id) setActiveSavedId(null);
  }

  function handleSave() {
    if (kingdomCards.length === 0) return;
    const entry = saveKingdomSet({
      name: saveName,
      cardIds: kingdomCards.map((card) => card.id),
      poolFilters,
    });
    setSavedSets((prev) => [entry, ...prev]);
    setActiveSavedId(entry.id);
    setSaveName("");
    setShowSaveForm(false);
  }

  function toggleLock(cardId: string) {
    setLockedIds((prev) => toggleInList(prev, cardId));
    setActiveSavedId(null);
  }

  return (
    <div className="flex h-screen flex-col">
      <AppHeader subtitle="Randomize a 10-card kingdom with balanced costs" />

      <div className="flex min-h-0 flex-1">
        <SetSidebar
          families={data.families}
          selectedSetIds={selectedSetIds}
          selectedFamilies={selectedFamilies}
          selectedEditions={selectedEditions}
          onSetToggle={(id) => setSelectedSetIds((prev) => toggleInList(prev, id))}
          onFamilyToggle={(family) =>
            setSelectedFamilies((prev) => toggleInList(prev, family))
          }
          onEditionToggle={(edition) =>
            setSelectedEditions((prev) => toggleInList(prev, edition))
          }
          onClearSets={() => {
            setSelectedSetIds([]);
            setSelectedFamilies([]);
            setSelectedEditions([]);
          }}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="space-y-3 border-b border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => generateKingdom()}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#1a1200] transition hover:bg-[var(--accent-dim)] hover:text-[var(--text)]"
              >
                Randomize Kingdom
              </button>
              {kingdomCards.length > 0 && (
                <button
                  type="button"
                  onClick={() => generateKingdom({ lockedIds })}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)] transition hover:border-[var(--accent-dim)]"
                >
                  Re-roll unlocked ({KINGDOM_SIZE - lockedIds.length})
                </button>
              )}
              {kingdomCards.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSaveForm((prev) => !prev)}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)] transition hover:border-[var(--accent-dim)]"
                >
                  Save set
                </button>
              )}
              <span className="text-sm tabular-nums text-[var(--muted)]">
                {eligiblePool.length} cards in pool
              </span>
            </div>

            {showSaveForm && kingdomCards.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Name this kingdom…"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="min-w-[200px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                />
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg border border-[var(--accent)] bg-[var(--accent)]/15 px-3 py-2 text-sm text-[var(--accent)]"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveForm(false)}
                  className="text-sm text-[var(--muted)] hover:underline"
                >
                  Cancel
                </button>
              </div>
            )}

            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

            {kingdomCards.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                <span>Cost spread:</span>
                {(["2", "3", "4", "5", "6+"] as const).map((bucket) => (
                  <span
                    key={bucket}
                    className="rounded-full border border-[var(--border)] px-2 py-0.5 tabular-nums"
                  >
                    ${bucket}: {costSpread[bucket]}
                  </span>
                ))}
                {lockedIds.length > 0 && (
                  <span className="text-[var(--accent)]">
                    {lockedIds.length} locked
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <label className="text-xs text-[var(--muted)]">Grid zoom</label>
              <input
                type="range"
                min={100}
                max={220}
                value={gridZoom}
                onChange={(e) => setGridZoom(Number(e.target.value))}
                className="w-40"
              />
              <span className="text-xs tabular-nums text-[var(--muted)]">{gridZoom}px</span>
            </div>
          </div>

          <div className="flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col">
              {kingdomCards.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-[var(--muted)]">
                  <p>Select your expansions, then randomize a kingdom.</p>
                  <p className="max-w-md text-sm">
                    Picks 10 kingdom cards with about two cards each from $2, $3,
                    $4, $5, and $6+ — similar to stratified randomizer decks.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex flex-wrap gap-3">
                    {kingdomCards.map((card) => {
                      const locked = lockedIds.includes(card.id);
                      return (
                        <div key={card.id} className="relative">
                          <button
                            type="button"
                            onClick={() => setSelectedCard(card)}
                            className="block text-left"
                          >
                            <img
                              src={card.image}
                              alt={card.name}
                              width={gridZoom}
                              className="rounded-lg border border-[var(--border)] shadow-sm transition hover:border-[var(--accent-dim)]"
                              style={{ width: gridZoom }}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleLock(card.id)}
                            className={`absolute right-1 top-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              locked
                                ? "bg-[var(--accent)] text-[#1a1200]"
                                : "bg-[var(--surface)]/90 text-[var(--muted)] hover:text-[var(--text)]"
                            }`}
                            title={locked ? "Unlock card" : "Lock card when re-rolling"}
                          >
                            {locked ? "Locked" : "Lock"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <aside className="flex w-72 shrink-0 flex-col border-l border-[var(--border)] bg-[var(--surface)]">
              <div className="border-b border-[var(--border)] p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Saved Kingdoms
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <SavedKingdomsPanel
                  savedSets={savedSets}
                  activeId={activeSavedId}
                  onLoad={handleLoadSaved}
                  onDelete={handleDeleteSaved}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          cards={kingdomCards}
          onClose={() => setSelectedCard(null)}
          onNavigate={setSelectedCard}
        />
      )}
    </div>
  );
}
