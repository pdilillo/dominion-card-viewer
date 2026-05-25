"use client";

import { useMemo, useState } from "react";
import catalogData from "@/data/catalog.json";
import { filterCards, sortCards } from "@/lib/catalog";
import type { CatalogData, DominionCard, Edition, SortField } from "@/lib/types";
import { AppHeader } from "@/components/AppHeader";
import { CardDetailModal } from "@/components/CardDetailModal";
import { CardGrid } from "@/components/CardGrid";
import { FilterBar } from "@/components/FilterBar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SetSidebar } from "@/components/SetSidebar";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useResponsiveGridZoom } from "@/hooks/useResponsiveGridZoom";

const data = catalogData as CatalogData;

export default function DominionViewer() {
  const isDesktop = useIsDesktop();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortField>("name");
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [selectedEditions, setSelectedEditions] = useState<Edition[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [kingdomOnly, setKingdomOnly] = useState(false);
  const [gridZoom, setGridZoom] = useState(140);
  const [selectedCard, setSelectedCard] = useState<DominionCard | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useResponsiveGridZoom(setGridZoom, 140, 160);

  const filteredCards = useMemo(() => {
    const filtered = filterCards(data.cards, {
      search,
      setIds: selectedSetIds,
      families: selectedFamilies,
      editions: selectedEditions,
      types: selectedTypes,
      kingdomOnly,
    });
    return sortCards(filtered, sort);
  }, [
    search,
    sort,
    selectedSetIds,
    selectedFamilies,
    selectedEditions,
    selectedTypes,
    kingdomOnly,
  ]);

  const hasActiveFilters =
    selectedSetIds.length > 0 ||
    selectedFamilies.length > 0 ||
    selectedEditions.length > 0;

  function toggleInList<T>(list: T[], value: T): T[] {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
  }

  const sidebarProps = {
    families: data.families,
    selectedSetIds,
    selectedFamilies,
    selectedEditions,
    onSetToggle: (id: string) => setSelectedSetIds((prev) => toggleInList(prev, id)),
    onFamilyToggle: (family: string) =>
      setSelectedFamilies((prev) => toggleInList(prev, family)),
    onEditionToggle: (edition: Edition) =>
      setSelectedEditions((prev) => toggleInList(prev, edition)),
    onClearSets: () => {
      setSelectedSetIds([]);
      setSelectedFamilies([]);
      setSelectedEditions([]);
    },
  };

  return (
    <div className="flex h-dvh flex-col">
      <AppHeader subtitle={`Browse ${data.cards.length} cards across all expansions`} />

      <div className="flex min-h-0 flex-1">
        {isDesktop && <SetSidebar {...sidebarProps} />}

        <div className="flex min-w-0 flex-1 flex-col">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            sort={sort}
            onSortChange={setSort}
            allTypes={data.allTypes}
            selectedTypes={selectedTypes}
            onTypeToggle={(type) =>
              setSelectedTypes((prev) => toggleInList(prev, type))
            }
            kingdomOnly={kingdomOnly}
            onKingdomOnlyChange={setKingdomOnly}
            gridZoom={gridZoom}
            onGridZoomChange={setGridZoom}
            resultCount={filteredCards.length}
            compact={!isDesktop}
            onOpenFilters={() => setFiltersOpen(true)}
            hasActiveFilters={hasActiveFilters}
          />
          <CardGrid
            cards={filteredCards}
            gridZoom={gridZoom}
            onCardClick={setSelectedCard}
          />
        </div>
      </div>

      <MobileDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
      >
        <SetSidebar
          {...sidebarProps}
          className="w-full border-r-0"
          hideHeader
        />
      </MobileDrawer>

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          cards={filteredCards}
          onClose={() => setSelectedCard(null)}
          onNavigate={setSelectedCard}
        />
      )}
    </div>
  );
}
