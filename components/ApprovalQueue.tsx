'use client';

import { useState } from 'react';
import type { SubmissionDetail } from '@/app/[projectSlug]/painel/submissoes/page';

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  rejeitada: 'Rejeitada',
  mais_info: 'Mais info',
};

const STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-ocre/10 text-ocre border-ocre/30',
  aprovada: 'bg-verde-medio/10 text-verde-medio border-verde-medio/30',
  rejeitada: 'bg-terracota/10 text-terracota border-terracota/30',
  mais_info: 'bg-blue-50 text-blue-600 border-blue-200',
};

interface Props {
  items: SubmissionDetail[];
  projectSlug: string;
}

export default function ApprovalQueue({ items: initialItems, projectSlug }: Props) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<string>('pendente');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filtered = filter === 'todos'
    ? items
    : items.filter(i => i.status === filter);

  const pendingCount = items.filter(i => i.status === 'pendente').length;

  async function handleReview(id: string, status: 'aprovada' | 'rejeitada' | 'mais_info') {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/submissions/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error();

      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status } : item
        )
      );
      setReviewingId(null);
    } catch {
      alert('Erro ao atualizar submissão. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {['pendente', 'aprovada', 'rejeitada', 'mais_info', 'todos'].map(f => {
          const count = f === 'todos'
            ? items.length
            : items.filter(i => i.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                filter === f
                  ? 'bg-verde-cerrado text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f === 'todos' ? 'Todos' : STATUS_LABELS[f]} ({count})
            </button>
          );
        })}
      </div>

      {pendingCount > 0 && (
        <p className="text-sm text-terracota font-medium">
          {pendingCount} submissão(ões) aguardando revisão
        </p>
      )}

      {/* Items */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">Nenhuma submissão nesta categoria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`card border-l-4 ${STATUS_COLORS[item.status]?.split(' ').find(c => c.startsWith('border-')) || 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-700">{item.submitted_by}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] || ''}`}>
                  {STATUS_LABELS[item.status] || item.status}
                </span>
              </div>

              {item.species_guess && (
                <p className="text-sm text-verde-cerrado mb-2">
                  Sugestão: <strong>{item.species_guess.common_name}</strong>{' '}
                  <span className="italic text-gray-400">({item.species_guess.scientific_name})</span>
                </p>
              )}

              <p className="text-xs text-gray-500 mb-1">
                Coordenadas: {item.lat.toFixed(6)}, {item.lng.toFixed(6)}
                <a
                  href={`/${projectSlug}/mapa`}
                  className="ml-2 text-verde-medio hover:underline"
                >
                  Ver no mapa
                </a>
              </p>

              {item.notes && (
                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                  {item.notes}
                </p>
              )}

              {/* Review actions */}
              {item.status === 'pendente' && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  {reviewingId === item.id ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleReview(item.id, 'aprovada')}
                        disabled={actionLoading}
                        className="px-4 py-1.5 bg-verde-medio text-white rounded-lg text-xs font-medium hover:bg-verde-cerrado transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleReview(item.id, 'rejeitada')}
                        disabled={actionLoading}
                        className="px-4 py-1.5 bg-terracota text-white rounded-lg text-xs font-medium hover:bg-terracota/80 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Rejeitar
                      </button>
                      <button
                        onClick={() => handleReview(item.id, 'mais_info')}
                        disabled={actionLoading}
                        className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Pedir mais info
                      </button>
                      <button
                        onClick={() => setReviewingId(null)}
                        className="px-4 py-1.5 text-gray-500 text-xs hover:underline cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReviewingId(item.id)}
                      className="text-sm text-verde-medio hover:underline font-medium cursor-pointer"
                    >
                      Revisar
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
