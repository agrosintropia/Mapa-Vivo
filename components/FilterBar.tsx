'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { SUBCLASSES } from '@/lib/subclasses';

interface SpeciesInfo {
  id: string;
  common_name: string;
  scientific_name: string;
  count: number;
}

interface Props {
  filterMode: 'species' | 'subclass';
  onFilterModeChange: (mode: 'species' | 'subclass') => void;
  speciesList: SpeciesInfo[];
  speciesFilter: string | null;
  onSpeciesFilter: (id: string | null) => void;
  subclassFilters: Set<string>;
  onToggleSubclass: (key: string) => void;
  filteredCount: number;
  totalCount: number;
  hasActiveFilter: boolean;
  onClearFilters: () => void;
}

// Remove accents for case-insensitive, accent-insensitive search
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export default function FilterBar({
  filterMode,
  onFilterModeChange,
  speciesList,
  speciesFilter,
  onSpeciesFilter,
  subclassFilters,
  onToggleSubclass,
  filteredCount,
  totalCount,
  hasActiveFilter,
  onClearFilters,
}: Props) {
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredSpecies = useMemo(() => {
    if (!searchText.trim()) return speciesList;
    const q = normalize(searchText);
    return speciesList.filter(
      (sp) =>
        normalize(sp.common_name).includes(q) ||
        normalize(sp.scientific_name).includes(q)
    );
  }, [searchText, speciesList]);

  const selectedSpeciesName = speciesFilter
    ? speciesList.find((sp) => sp.id === speciesFilter)?.common_name
    : null;

  const selectedSpeciesCount = speciesFilter
    ? speciesList.find((sp) => sp.id === speciesFilter)?.count ?? 0
    : 0;

  return (
    <div className="bg-white border-b border-areia shadow-sm z-40 relative">
      {/* Tab toggle */}
      <div className="flex border-b border-gray-100">
        <button
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            filterMode === 'species'
              ? 'text-verde-cerrado border-b-2 border-verde-medio'
              : 'text-gray-400 hover:text-gray-600'
          }`}
          onClick={() => onFilterModeChange('species')}
        >
          Por espécie
        </button>
        <button
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            filterMode === 'subclass'
              ? 'text-verde-cerrado border-b-2 border-verde-medio'
              : 'text-gray-400 hover:text-gray-600'
          }`}
          onClick={() => onFilterModeChange('subclass')}
        >
          Por subclasse
        </button>
      </div>

      <div className="px-3 py-2.5">
        {filterMode === 'species' && (
          <div ref={dropdownRef} className="relative">
            <input
              type="text"
              placeholder="Buscar espécie..."
              value={speciesFilter ? selectedSpeciesName || '' : searchText}
              onChange={(e) => {
                if (speciesFilter) {
                  onSpeciesFilter(null);
                }
                setSearchText(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-verde-medio/30 focus:border-verde-medio
                bg-areia/50 placeholder-gray-400"
            />
            {speciesFilter && (
              <button
                onClick={() => {
                  onSpeciesFilter(null);
                  setSearchText('');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                aria-label="Limpar busca"
              >
                &times;
              </button>
            )}
            {showDropdown && !speciesFilter && filteredSpecies.length > 0 && (
              <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                {filteredSpecies.map((sp) => (
                  <li key={sp.id}>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-areia/60 transition-colors"
                      onClick={() => {
                        onSpeciesFilter(sp.id);
                        setSearchText('');
                        setShowDropdown(false);
                      }}
                    >
                      <span className="font-medium text-sm text-verde-cerrado">
                        {sp.common_name}
                      </span>
                      <span className="text-xs text-gray-400 italic ml-2">
                        {sp.scientific_name}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">
                        ({sp.count})
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {showDropdown && !speciesFilter && searchText && filteredSpecies.length === 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-400 z-50">
                Nenhuma espécie encontrada
              </div>
            )}
          </div>
        )}

        {filterMode === 'subclass' && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {SUBCLASSES.map((sc) => (
              <button
                key={sc.key}
                onClick={() => onToggleSubclass(sc.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  subclassFilters.has(sc.key)
                    ? 'bg-verde-medio text-white border-verde-medio'
                    : 'bg-areia/70 text-verde-cerrado border-gray-200 hover:border-verde-medio/50'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Result counter */}
      <div className="px-3 pb-2.5 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {hasActiveFilter ? (
            <>
              <span className="font-semibold text-verde-cerrado">{filteredCount}</span>
              {filterMode === 'species' && speciesFilter && selectedSpeciesName
                ? ` ${filteredCount === 1 ? selectedSpeciesName : selectedSpeciesName + 's'} encontrado${filteredCount === 1 ? '' : 's'}`
                : ` árvore${filteredCount === 1 ? '' : 's'} encontrada${filteredCount === 1 ? '' : 's'}`}
            </>
          ) : (
            <>
              Mostrando todas as{' '}
              <span className="font-semibold text-verde-cerrado">{totalCount}</span> árvores
            </>
          )}
        </p>
        {hasActiveFilter && (
          <button
            onClick={onClearFilters}
            className="text-xs text-terracota hover:underline font-medium"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
