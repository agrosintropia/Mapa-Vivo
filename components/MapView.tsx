'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import FilterBar from './FilterBar';
import MapLegend from './MapLegend';
import type { ProjectData, TreeData } from '@/lib/types';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-areia">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-verde-medio border-t-transparent mx-auto mb-4" />
        <p className="text-verde-cerrado font-medium">Carregando mapa...</p>
      </div>
    </div>
  ),
});

// 14 distinct, accessible colors for species markers
const SPECIES_COLORS = [
  '#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4',
  '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990',
  '#dcbeff', '#9A6324', '#800000', '#aaffc3',
];

function getSpeciesColor(speciesId: string, colorMap: Map<string, string>): string {
  if (colorMap.has(speciesId)) return colorMap.get(speciesId)!;
  const color = SPECIES_COLORS[colorMap.size % SPECIES_COLORS.length];
  colorMap.set(speciesId, color);
  return color;
}

interface Props {
  project: ProjectData;
  trees: TreeData[];
}

export default function MapView({ project, trees }: Props) {
  const [speciesFilter, setSpeciesFilter] = useState<string | null>(null);
  const [subclassFilters, setSubclassFilters] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<'species' | 'subclass'>('species');

  // Build stable species-color map
  const speciesColorMap = useMemo(() => {
    const map = new Map<string, string>();
    const uniqueSpeciesIds = [...new Set(trees.map((t) => t.species.id))];
    uniqueSpeciesIds.forEach((id) => getSpeciesColor(id, map));
    return map;
  }, [trees]);

  // Build species list for search
  const speciesList = useMemo(() => {
    const map = new Map<string, { id: string; common_name: string; scientific_name: string; count: number }>();
    for (const tree of trees) {
      const sp = tree.species;
      if (map.has(sp.id)) {
        map.get(sp.id)!.count++;
      } else {
        map.set(sp.id, {
          id: sp.id,
          common_name: sp.common_name,
          scientific_name: sp.scientific_name,
          count: 1,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.common_name.localeCompare(b.common_name, 'pt-BR')
    );
  }, [trees]);

  // Filter trees
  const filteredTrees = useMemo(() => {
    if (filterMode === 'species' && speciesFilter) {
      return trees.filter((t) => t.species.id === speciesFilter);
    }
    if (filterMode === 'subclass' && subclassFilters.size > 0) {
      return trees.filter((t) =>
        t.species.subclasses.some((sc) => subclassFilters.has(sc))
      );
    }
    return trees;
  }, [trees, speciesFilter, subclassFilters, filterMode]);

  const hasActiveFilter =
    (filterMode === 'species' && speciesFilter !== null) ||
    (filterMode === 'subclass' && subclassFilters.size > 0);

  const clearFilters = useCallback(() => {
    setSpeciesFilter(null);
    setSubclassFilters(new Set());
  }, []);

  const toggleSubclass = useCallback((key: string) => {
    setSubclassFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col relative">
      <FilterBar
        filterMode={filterMode}
        onFilterModeChange={setFilterMode}
        speciesList={speciesList}
        speciesFilter={speciesFilter}
        onSpeciesFilter={setSpeciesFilter}
        subclassFilters={subclassFilters}
        onToggleSubclass={toggleSubclass}
        filteredCount={filteredTrees.length}
        totalCount={trees.length}
        hasActiveFilter={hasActiveFilter}
        onClearFilters={clearFilters}
      />
      <div className="flex-1 relative">
        <LeafletMap
          project={project}
          allTrees={trees}
          filteredTrees={filteredTrees}
          speciesColorMap={speciesColorMap}
        />
        <MapLegend
          trees={filteredTrees}
          speciesColorMap={speciesColorMap}
        />
      </div>
    </div>
  );
}
