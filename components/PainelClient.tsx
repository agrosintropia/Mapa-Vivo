'use client';

import { useState } from 'react';
import type { PainelData } from '@/app/[projectSlug]/painel/page';

type Tab = 'arvores' | 'submissoes';

const STATUS_LABELS: Record<string, string> = {
  viva: 'Viva',
  doente: 'Doente',
  em_tratamento: 'Em tratamento',
  morta: 'Morta',
  removida: 'Removida',
};

const STATUS_COLORS: Record<string, string> = {
  viva: 'bg-verde-medio/10 text-verde-medio',
  doente: 'bg-ocre/10 text-ocre',
  em_tratamento: 'bg-terracota/10 text-terracota',
  morta: 'bg-gray-200 text-gray-600',
  removida: 'bg-gray-100 text-gray-400',
};

const RELIABILITY_LABELS: Record<string, string> = {
  validado_tecnico: 'Validado',
  pendente: 'Pendente',
  declarado_gestor: 'Gestor',
};

const RELIABILITY_COLORS: Record<string, string> = {
  validado_tecnico: 'bg-verde-cerrado/10 text-verde-cerrado',
  pendente: 'bg-ocre/10 text-ocre',
  declarado_gestor: 'bg-blue-50 text-blue-600',
};

const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  rejeitada: 'Rejeitada',
  mais_info: 'Mais info',
};

const SUBMISSION_STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-ocre/10 text-ocre',
  aprovada: 'bg-verde-medio/10 text-verde-medio',
  rejeitada: 'bg-terracota/10 text-terracota',
  mais_info: 'bg-blue-50 text-blue-600',
};

export default function PainelClient({ data }: { data: PainelData }) {
  const [tab, setTab] = useState<Tab>('arvores');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [reliabilityFilter, setReliabilityFilter] = useState<string>('');

  const filteredTrees = data.trees.filter(tree => {
    if (statusFilter && tree.status !== statusFilter) return false;
    if (reliabilityFilter && tree.reliability !== reliabilityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        tree.species.common_name.toLowerCase().includes(q) ||
        tree.species.scientific_name.toLowerCase().includes(q) ||
        tree.qr_slug.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <a href={`/${data.projectSlug}/painel/arvores/nova`} className="btn-primary text-sm">
          + Cadastrar árvore
        </a>
        <a href={`/api/projects/${data.projectSlug}/export`} className="btn-secondary text-sm">
          Exportar CSV
        </a>
        <a href={`/${data.projectSlug}/relatorio`} className="bg-white text-verde-cerrado border border-verde-medio px-6 py-3 rounded-lg font-semibold hover:bg-verde-medio/5 transition-colors text-sm">
          Relatório de diversidade
        </a>
        <a href={`/${data.projectSlug}/painel/observacoes`} className="bg-white text-terracota border border-terracota px-6 py-3 rounded-lg font-semibold hover:bg-terracota/5 transition-colors text-sm">
          📝 Observações dos moradores
        </a>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-verde-cerrado">{data.totalTrees}</p>
          <p className="text-sm text-gray-500">Árvores</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-verde-medio">
            {data.trees.filter(t => t.reliability === 'validado_tecnico').length}
          </p>
          <p className="text-sm text-gray-500">Validadas</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-ocre">
            {data.trees.filter(t => t.reliability === 'pendente').length}
          </p>
          <p className="text-sm text-gray-500">Pendentes</p>
        </div>
        <div className="card text-center py-4 relative">
          <p className="text-2xl font-bold text-terracota">{data.pendingCount}</p>
          <p className="text-sm text-gray-500">Submissões</p>
          {data.pendingCount > 0 && (
            <span className="absolute top-2 right-2 w-3 h-3 bg-terracota rounded-full animate-pulse" />
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
        <button
          onClick={() => setTab('arvores')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            tab === 'arvores'
              ? 'bg-verde-cerrado text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Árvores ({data.totalTrees})
        </button>
        <button
          onClick={() => setTab('submissoes')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer relative ${
            tab === 'submissoes'
              ? 'bg-verde-cerrado text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Submissões ({data.recentSubmissions.length})
          {data.pendingCount > 0 && tab !== 'submissoes' && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracota text-white text-xs rounded-full flex items-center justify-center">
              {data.pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Trees tab */}
      {tab === 'arvores' && (
        <div className="card">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Buscar por nome ou código..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer"
            >
              <option value="">Todos os estados</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              value={reliabilityFilter}
              onChange={e => setReliabilityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer"
            >
              <option value="">Toda confiabilidade</option>
              {Object.entries(RELIABILITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <p className="text-xs text-gray-400 mb-3">
            {filteredTrees.length === data.totalTrees
              ? `Mostrando todas as ${data.totalTrees} árvores`
              : `${filteredTrees.length} de ${data.totalTrees} árvores`}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-medium text-gray-500">Código</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">Espécie</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500 hidden md:table-cell">Científico</th>
                  <th className="text-center py-2 px-2 font-medium text-gray-500">Estado</th>
                  <th className="text-center py-2 px-2 font-medium text-gray-500">Selo</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500 hidden md:table-cell">DAP</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500 hidden md:table-cell">Altura</th>
                  <th className="text-center py-2 px-2 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrees.map(tree => (
                  <tr key={tree.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 font-mono text-xs text-gray-500">{tree.qr_slug}</td>
                    <td className="py-2 px-2 font-medium text-verde-cerrado">{tree.species.common_name}</td>
                    <td className="py-2 px-2 italic text-gray-400 hidden md:table-cell">{tree.species.scientific_name}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[tree.status] || ''}`}>
                        {STATUS_LABELS[tree.status] || tree.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${RELIABILITY_COLORS[tree.reliability] || ''}`}>
                        {RELIABILITY_LABELS[tree.reliability] || tree.reliability}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right text-gray-500 hidden md:table-cell">
                      {tree.dbh_cm != null ? `${tree.dbh_cm} cm` : '—'}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-500 hidden md:table-cell">
                      {tree.height_m != null ? `${tree.height_m} m` : '—'}
                    </td>
                    <td className="py-2 px-2 text-center space-x-2">
                      <a
                        href={`/arvore/${tree.qr_slug}`}
                        className="text-verde-medio hover:underline text-xs"
                      >
                        Ficha
                      </a>
                      <a
                        href={`/${data.projectSlug}/painel/arvores/${tree.id}`}
                        className="text-ocre hover:underline text-xs"
                      >
                        Editar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTrees.length === 0 && (
            <p className="text-center text-gray-400 py-8">Nenhuma árvore encontrada.</p>
          )}
        </div>
      )}

      {/* Submissions tab */}
      {tab === 'submissoes' && (
        <div className="space-y-4">
          {data.userRole === 'tecnico' && data.pendingCount > 0 && (
            <div className="card border-l-4 border-l-terracota">
              <p className="text-sm text-gray-600">
                <strong className="text-terracota">{data.pendingCount} submissões</strong> aguardando
                sua revisão.
              </p>
              <a
                href={`/${data.projectSlug}/painel/submissoes`}
                className="btn-primary inline-block mt-3 text-sm"
              >
                Abrir fila de revisão
              </a>
            </div>
          )}

          <div className="card">
            <h3 className="font-display text-lg font-bold text-verde-cerrado mb-4">
              Submissões recentes
            </h3>
            {data.recentSubmissions.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Nenhuma submissão ainda.</p>
            ) : (
              <div className="space-y-3">
                {data.recentSubmissions.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{sub.submitted_by}</p>
                      {sub.notes && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{sub.notes}</p>
                      )}
                      <p className="text-xs text-gray-300 mt-0.5">
                        {new Date(sub.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SUBMISSION_STATUS_COLORS[sub.status] || ''}`}>
                      {SUBMISSION_STATUS_LABELS[sub.status] || sub.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
