"use client";

import { useMemo, useState } from "react";
import catalogData from "@/data/catalog.json";
import { filterCards, sortCards } from "@/lib/catalog";
import type { CatalogData, DominionCard, Edition, SortField } from "@/lib/types";
import { AppHeader } from "@/components/AppHeader";
import { CardDetailModal } from "@/components/CardDetailModal";
import { CardGrid } from "@/components/CardGrid";
import { FilterBar } from "@/components/FilterBar";
import { SetSidebar } from "@/components/SetSidebar";

const data = catalogData as CatalogData;

export default function DominionViewer() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortField>("name");
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [selectedEditions, setSelectedEditions] = useState<Edition[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [kingdomOnly, setKingdomOnly] = useState(false);
  const [gridZoom, setGridZoom] = useState(140);
  const [selectedCard, setSelectedCard] = useState<DominionCard | null>(null);

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

  function toggleInList<T>(list: T[], value: T): T[] {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
  }

  return (
    <div className="flex h-screen flex-col">
      <AppHeader subtitle={`Browse ${data.cards.length} cards across all expansions`} />

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
          />
          <CardGrid
            cards={filteredCards}
            gridZoom={gridZoom}
            onCardClick={setSelectedCard}
          />
        </div>
      </div>

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
