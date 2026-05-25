"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import catalogData from "@/data/catalog.json";
import { filterFamiliesForRandomizer, sanitizeRandomizerPoolFilters, sortCards } from "@/lib/catalog";
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
import type {
  AttackPreference,
  CatalogData,
  DominionCard,
  SavedKingdomSet,
} from "@/lib/types";
import { AppHeader } from "@/components/AppHeader";
import { CardDetailModal } from "@/components/CardDetailModal";
import { CardNameOverlay } from "@/components/CardNameOverlay";
import { MobileDrawer } from "@/components/MobileDrawer";
import { RandomizerFilterBar } from "@/components/RandomizerFilterBar";
import { SavedKingdomsPanel } from "@/components/SavedKingdomsPanel";
import { SetSidebar } from "@/components/SetSidebar";
import { cardBorderStyle, getCardBorderGradient, hasCardTypeBorder } from "@/lib/cardTypeColors";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useResponsiveGridZoom } from "@/hooks/useResponsiveGridZoom";

const data = catalogData as CatalogData;
const validCardIds = new Set(data.cards.map((card) => card.id));
const randomizerFamilies = filterFamiliesForRandomizer(data.families);

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function RandomizerPage() {
  const isDesktop = useIsDesktop();
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [familyEditions, setFamilyEditions] = useState<Partial<Record<string, "1" | "2">>>({});
  const [attackPreference, setAttackPreference] = useState<AttackPreference>("any");
  const [gridZoom, setGridZoom] = useState(160);
  const [kingdomCards, setKingdomCards] = useState<DominionCard[]>([]);
  const [lockedIds, setLockedIds] = useState<string[]>([]);
  const [selectedCard, setSelectedCard] = useState<DominionCard | null>(null);
  const [savedSets, setSavedSets] = useState<SavedKingdomSet[]>([]);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [saveName, setSaveName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poolOpen, setPoolOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  useResponsiveGridZoom(setGridZoom, 160, 150);

  const poolFilters = useMemo(
    () =>
      sanitizeRandomizerPoolFilters(
        {
          setIds: selectedSetIds,
          families: selectedFamilies,
          familyEditions,
          attackPreference,
        },
        data.families,
      ),
    [selectedSetIds, selectedFamilies, familyEditions, attackPreference],
  );

  const eligiblePool = useMemo(
    () => getEligibleKingdomPool(data.cards, poolFilters),
    [poolFilters],
  );

  const costSpread = useMemo(() => summarizeCostSpread(kingdomCards), [kingdomCards]);

  const hasPoolSelection =
    selectedSetIds.length > 0 ||
    selectedFamilies.length > 0 ||
    Object.keys(familyEditions).length > 0;

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
        const attackHint =
          attackPreference === "exclude"
            ? " No-attacks mode limits the pool further — try adding more expansions."
            : "";
        setError(
          `Need at least ${KINGDOM_SIZE} kingdom cards in the pool (currently ${eligiblePool.length}). Try selecting more expansions.${attackHint}`,
        );
        return;
      }

      if (
        attackPreference === "require" &&
        !eligiblePool.some((card) => card.types.includes("Attack"))
      ) {
        setError(
          "No Attack cards in the current pool. Add expansions with attacks or switch to Any.",
        );
        return;
      }

      const next = randomizeKingdom(eligiblePool, {
        lockedIds: options?.lockedIds ?? lockedIds,
        attackPreference,
      });
      setKingdomCards(sortCards(next, "cost-asc"));
    },
    [eligiblePool, lockedIds, attackPreference],
  );

  function applyPoolFilters(filters?: SavedKingdomSet["poolFilters"]) {
    const sanitized = sanitizeRandomizerPoolFilters(
      {
        setIds: filters?.setIds ?? [],
        families: filters?.families ?? [],
        familyEditions: filters?.familyEditions ?? {},
        attackPreference: filters?.attackPreference ?? "any",
      },
      data.families,
    );
    setSelectedSetIds(sanitized.setIds ?? []);
    setSelectedFamilies(sanitized.families ?? []);
    setFamilyEditions(sanitized.familyEditions ?? {});
    setAttackPreference(sanitized.attackPreference ?? "any");
  }

  function handleFamilyEditionChange(family: string, edition: "1" | "2" | undefined) {
    setFamilyEditions((prev) => {
      const next = { ...prev };
      if (edition === undefined) {
        delete next[family];
      } else {
        next[family] = edition;
      }
      return next;
    });
    setActiveSavedId(null);
  }

  function handleLoadSaved(set: SavedKingdomSet) {
    const cards = resolveCardsById(data.cards, set.cardIds);
    setKingdomCards(sortCards(cards, "cost-asc"));
    setLockedIds([]);
    setActiveSavedId(set.id);
    applyPoolFilters(set.poolFilters);
    setError(null);
    setShowSaveForm(false);
    setSavedOpen(false);
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

  const sidebarProps = {
    families: randomizerFamilies,
    selectedSetIds,
    selectedFamilies,
    familyEditions,
    editionMode: "per-family" as const,
    title: "Kingdom pool",
    setsSectionLabel: "Sets & editions",
    onSetToggle: (id: string) => {
      setSelectedSetIds((prev) => toggleInList(prev, id));
      setActiveSavedId(null);
    },
    onFamilyToggle: (family: string) => {
      setSelectedFamilies((prev) => toggleInList(prev, family));
      setActiveSavedId(null);
    },
    onFamilyEditionChange: handleFamilyEditionChange,
    onClearSets: () => {
      setSelectedSetIds([]);
      setSelectedFamilies([]);
      setFamilyEditions({});
    },
  };

  return (
    <div className="flex h-dvh flex-col">
      <AppHeader subtitle="Randomize a 10-card kingdom with balanced costs" />

      <div className="flex min-h-0 flex-1">
        {isDesktop && <SetSidebar {...sidebarProps} />}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="space-y-3 border-b border-[var(--border)] bg-[var(--surface)] p-4">
            <RandomizerFilterBar
              families={randomizerFamilies}
              selectedFamilies={selectedFamilies}
              selectedSetIds={selectedSetIds}
              attackPreference={attackPreference}
              poolCount={eligiblePool.length}
              onFamilyToggle={(family) => {
                setSelectedFamilies((prev) => toggleInList(prev, family));
                setActiveSavedId(null);
              }}
              onAttackPreferenceChange={(value) => {
                setAttackPreference(value);
                setActiveSavedId(null);
              }}
              onClearSets={() => {
                setSelectedSetIds([]);
                setSelectedFamilies([]);
                setFamilyEditions({});
                setActiveSavedId(null);
              }}
            />

            <div className="flex flex-wrap items-center gap-3">
              {!isDesktop && (
                <>
                  <button
                    type="button"
                    onClick={() => setPoolOpen(true)}
                    className="relative rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)] transition hover:border-[var(--accent-dim)]"
                  >
                    Pool
                    {hasPoolSelection && (
                      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSavedOpen(true)}
                    className="relative rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)] transition hover:border-[var(--accent-dim)]"
                  >
                    Saved
                    {savedSets.length > 0 && (
                      <span className="ml-1.5 rounded-full bg-[var(--accent)]/20 px-1.5 py-0.5 text-xs tabular-nums text-[var(--accent)]">
                        {savedSets.length}
                      </span>
                    )}
                  </button>
                </>
              )}
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
                  <p>Select expansions to pull from, then randomize a kingdom.</p>
                  <p className="max-w-md text-sm">
                    Choose expansions above{isDesktop ? " or in the sidebar" : " or via Pool"},
                    set your attack preference, then generate 10 cards with a balanced $2–$6+
                    cost spread.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex flex-wrap gap-3">
                    {kingdomCards.map((card) => {
                      const locked = lockedIds.includes(card.id);
                      const borderGradient = getCardBorderGradient(card.types);
                      const hasTypeBorder = hasCardTypeBorder(card.types);

                      const cardImage = (
                        <div
                          className={`relative overflow-hidden ${
                            borderGradient ? "rounded-[5px]" : "rounded-lg"
                          }`}
                          style={{ width: gridZoom }}
                        >
                          <img
                            src={card.image}
                            alt={card.name}
                            width={gridZoom}
                            className={`shadow-sm transition ${
                              borderGradient
                                ? "rounded-[5px] hover:brightness-110"
                                : `rounded-lg border-[3px] ${
                                    hasTypeBorder
                                      ? "hover:brightness-110"
                                      : "border-[var(--border)] hover:border-[var(--accent-dim)]"
                                  }`
                            }`}
                            style={{
                              width: gridZoom,
                              ...(borderGradient ? undefined : cardBorderStyle(card.types)),
                            }}
                          />
                          <CardNameOverlay name={card.name} />
                        </div>
                      );

                      return (
                        <div key={card.id} className="relative">
                          <button
                            type="button"
                            onClick={() => setSelectedCard(card)}
                            className="block text-left"
                          >
                            {borderGradient ? (
                              <div
                                className="rounded-lg p-[3px] transition hover:brightness-110"
                                style={{ background: borderGradient }}
                              >
                                {cardImage}
                              </div>
                            ) : (
                              cardImage
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleLock(card.id)}
                            className={`absolute right-2 top-2 flex min-h-11 min-w-11 items-center justify-center rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                              locked
                                ? "bg-[var(--accent)] text-[#1a1200]"
                                : "bg-[var(--surface)]/90 text-[var(--muted)] hover:text-[var(--text)]"
                            }`}
                            title={locked ? "Unlock card" : "Lock card when re-rolling"}
                            aria-label={locked ? "Unlock card" : "Lock card when re-rolling"}
                          >
                            {locked ? "🔒" : "🔓"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {isDesktop && (
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
            )}
          </div>
        </div>
      </div>

      <MobileDrawer open={poolOpen} onClose={() => setPoolOpen(false)} title="Kingdom pool">
        <SetSidebar {...sidebarProps} className="w-full border-r-0" hideHeader />
      </MobileDrawer>

      <MobileDrawer open={savedOpen} onClose={() => setSavedOpen(false)} title="Saved Kingdoms">
        <div className="flex-1 overflow-y-auto p-4">
          <SavedKingdomsPanel
            savedSets={savedSets}
            activeId={activeSavedId}
            onLoad={handleLoadSaved}
            onDelete={handleDeleteSaved}
          />
        </div>
      </MobileDrawer>

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
