'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { TreeData } from '@/lib/types';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  viva: { label: 'Viva', color: 'text-green-700 bg-green-50' },
  doente: { label: 'Doente', color: 'text-amber-700 bg-amber-50' },
  em_tratamento: { label: 'Em tratamento', color: 'text-blue-700 bg-blue-50' },
  morta: { label: 'Morta', color: 'text-gray-600 bg-gray-100' },
  removida: { label: 'Removida', color: 'text-red-700 bg-red-50' },
};

const STRATA_LABELS: Record<string, string> = {
  emergente: 'Emergente',
  alto: 'Alto',
  medio: 'Médio',
  baixo: 'Baixo',
  arbustivo: 'Arbustivo',
};

interface Props {
  trees: TreeData[];
  hasActiveFilter: boolean;
  totalCount: number;
}

export default function TreeTable({ trees, hasActiveFilter, totalCount }: Props) {
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(
    () => [...trees].sort((a, b) =>
      a.species.common_name.localeCompare(b.species.common_name, 'pt-BR')
    ),
    [trees]
  );

  const displayed = expanded ? sorted : sorted.slice(0, 20);

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold text-verde-cerrado uppercase tracking-wide">
          {hasActiveFilter
            ? `${trees.length} de ${totalCount} árvores`
            : `${trees.length} árvores`}
        </h2>
        {hasActiveFilter && (
          <span className="text-xs text-gray-400">Filtro ativo</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-2 font-medium">Nome popular</th>
              <th className="px-4 py-2 font-medium hidden sm:table-cell">Nome científico</th>
              <th className="px-4 py-2 font-medium hidden md:table-cell">Família</th>
              <th className="px-4 py-2 font-medium hidden md:table-cell">Estrato</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium hidden sm:table-cell">DAP</th>
              <th className="px-4 py-2 font-medium hidden sm:table-cell">Altura</th>
              <th className="px-4 py-2 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayed.map((tree) => {
              const st = STATUS_LABELS[tree.status] || { label: tree.status, color: 'text-gray-600 bg-gray-50' };
              return (
                <tr key={tree.id} className="hover:bg-areia/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-800">
                    {tree.species.common_name}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 italic hidden sm:table-cell">
                    {tree.species.scientific_name}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 hidden md:table-cell">
                    {tree.species.family}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 hidden md:table-cell">
                    {STRATA_LABELS[tree.species.strata] || tree.species.strata}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 hidden sm:table-cell">
                    {tree.dbh_cm != null ? `${tree.dbh_cm} cm` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 hidden sm:table-cell">
                    {tree.height_m != null ? `${tree.height_m} m` : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/arvore/${tree.qr_slug}`}
                      className="text-verde-medio hover:text-verde-cerrado text-xs font-medium"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sorted.length > 20 && !expanded && (
        <div className="px-4 py-3 text-center border-t border-gray-100">
          <button
            onClick={() => setExpanded(true)}
            className="text-sm text-verde-medio hover:text-verde-cerrado font-medium cursor-pointer"
          >
            Ver todas as {sorted.length} árvores
          </button>
        </div>
      )}

      {expanded && sorted.length > 20 && (
        <div className="px-4 py-3 text-center border-t border-gray-100">
          <button
            onClick={() => setExpanded(false)}
            className="text-sm text-gray-400 hover:text-gray-600 font-medium cursor-pointer"
          >
            Recolher lista
          </button>
        </div>
      )}

      {trees.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-400 text-sm">
          Nenhuma árvore encontrada com os filtros selecionados.
        </div>
      )}
    </div>
  );
}
