'use client';

import { useState } from 'react';

const TYPE_LABELS: Record<string, string> = {
  saude: '🩺 Saúde',
  frutificacao: '🍎 Frutificação',
  floracao: '🌸 Floração',
  fauna: '🦜 Fauna',
  outro: '📋 Outro',
};

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  validada: 'Validada',
  consulta_tecnica: 'Consulta técnica',
  descartada: 'Descartada',
};

const STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-ocre/10 text-ocre',
  validada: 'bg-verde-medio/10 text-verde-medio',
  consulta_tecnica: 'bg-blue-50 text-blue-600',
  descartada: 'bg-gray-100 text-gray-500',
};

interface ObservationData {
  id: string;
  type: string;
  description: string | null;
  audio_url: string | null;
  photo_urls: string[];
  status: string;
  reviewer_note: string | null;
  user_name: string;
  created_at: string;
  tree: {
    qr_slug: string;
    common_name: string;
    scientific_name: string;
  };
}

interface Props {
  observations: ObservationData[];
  projectSlug: string;
}

export default function ObservationReviewClient({ observations: initial, projectSlug }: Props) {
  const [observations, setObservations] = useState(initial);
  const [filter, setFilter] = useState<string>('pendente');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const filtered = filter === 'todas'
    ? observations
    : observations.filter((o) => o.status === filter);

  const pendingCount = observations.filter((o) => o.status === 'pendente').length;

  async function handleReview(id: string, action: string) {
    setProcessing(true);
    try {
      const res = await fetch(`/api/observations/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note: reviewNote }),
      });

      if (res.ok) {
        setObservations((prev) =>
          prev.map((o) =>
            o.id === id ? { ...o, status: action, reviewer_note: reviewNote || null } : o
          )
        );
        setReviewingId(null);
        setReviewNote('');
      }
    } catch {
      alert('Erro ao processar observação.');
    }
    setProcessing(false);
  }

  return (
    <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['pendente', 'validada', 'consulta_tecnica', 'descartada', 'todas'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === f
                ? 'bg-verde-cerrado text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'todas' ? 'Todas' : STATUS_LABELS[f]}
            {f === 'pendente' && pendingCount > 0 && (
              <span className="ml-1 bg-terracota text-white text-xs rounded-full px-1.5">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500">Nenhuma observação {filter !== 'todas' ? STATUS_LABELS[filter]?.toLowerCase() : ''}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((obs) => (
            <div key={obs.id} className="card space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-verde-cerrado">
                    {obs.tree.common_name}
                    <span className="text-xs font-normal text-gray-400 ml-2">{obs.tree.qr_slug}</span>
                  </p>
                  <p className="text-xs text-gray-500 italic">{obs.tree.scientific_name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[obs.status] || ''}`}>
                  {STATUS_LABELS[obs.status] || obs.status}
                </span>
              </div>

              {/* Type & user */}
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium">{TYPE_LABELS[obs.type] || obs.type}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">{obs.user_name}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">{new Date(obs.created_at).toLocaleDateString('pt-BR')}</span>
              </div>

              {/* Description */}
              {obs.description && (
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{obs.description}</p>
              )}

              {/* Audio */}
              {obs.audio_url && (
                <audio src={obs.audio_url} controls className="w-full h-10" />
              )}

              {/* Photos */}
              {obs.photo_urls.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {obs.photo_urls.map((url, i) => (
                    <img key={i} src={url} alt={`Foto ${i + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                  ))}
                </div>
              )}

              {/* Reviewer note */}
              {obs.reviewer_note && (
                <p className="text-xs text-gray-500 italic border-l-2 border-verde-medio pl-2">
                  Nota do revisor: {obs.reviewer_note}
                </p>
              )}

              {/* Actions */}
              {obs.status === 'pendente' && (
                <div>
                  {reviewingId === obs.id ? (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <textarea
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="Nota do revisor (opcional)..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none h-16 focus:ring-2 focus:ring-verde-medio/50 focus:border-verde-medio outline-none"
                      />
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleReview(obs.id, 'validada')}
                          disabled={processing}
                          className="bg-verde-medio text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-verde-cerrado transition-colors cursor-pointer disabled:opacity-50"
                        >
                          ✓ Validar e adicionar à ficha
                        </button>
                        <button
                          onClick={() => handleReview(obs.id, 'consulta_tecnica')}
                          disabled={processing}
                          className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          🔬 Solicitar consulta técnica
                        </button>
                        <button
                          onClick={() => handleReview(obs.id, 'descartada')}
                          disabled={processing}
                          className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          ✕ Descartar
                        </button>
                        <button
                          onClick={() => { setReviewingId(null); setReviewNote(''); }}
                          className="text-gray-400 text-sm hover:underline cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReviewingId(obs.id)}
                      className="text-verde-medio text-sm font-medium hover:underline cursor-pointer"
                    >
                      Revisar →
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
