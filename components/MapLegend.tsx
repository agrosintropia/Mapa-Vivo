'use client';

import { useState, useMemo } from 'react';
import type { TreeData } from '@/lib/types';

interface Props {
  trees: TreeData[];
  speciesColorMap: Map<string, string>;
}

export default function MapLegend({ trees, speciesColorMap }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const legendItems = useMemo(() => {
    const map = new Map<string, { name: string; color: string; count: number }>();
    for (const tree of trees) {
      const sp = tree.species;
      if (map.has(sp.id)) {
        map.get(sp.id)!.count++;
      } else {
        map.set(sp.id, {
          name: sp.common_name,
          color: speciesColorMap.get(sp.id) || '#888',
          count: 1,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [trees, speciesColorMap]);

  if (legendItems.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-4 z-[1000] max-w-[260px]">
      {/* Toggle button (always visible on mobile) */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="bg-white rounded-lg shadow-md px-3 py-2 flex items-center gap-2 text-sm font-medium text-verde-cerrado hover:bg-areia/50 transition-colors border border-gray-200 md:hidden"
      >
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: legendItems[0]?.color }}
        />
        Legenda
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Legend panel — always visible on desktop, toggled on mobile */}
      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } md:block mt-2 md:mt-0 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 p-3 max-h-[50vh] overflow-y-auto`}
      >
        <h3 className="text-xs font-bold text-verde-cerrado uppercase tracking-wide mb-2">
          Espécies ({legendItems.length})
        </h3>
        <ul className="space-y-1.5">
          {legendItems.map((item) => (
            <li key={item.name} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full flex-shrink-0 border border-white"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-700 truncate">{item.name}</span>
              <span className="text-xs text-gray-400 ml-auto flex-shrink-0">{item.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
