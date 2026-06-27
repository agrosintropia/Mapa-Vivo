'use client';

import { useState, FormEvent } from 'react';

interface SpeciesOption {
  id: string;
  common_name: string;
  scientific_name: string;
}

interface Props {
  projectSlug: string;
  species: SpeciesOption[];
}

export default function SubmissionForm({ projectSlug, species }: Props) {
  const [submittedBy, setSubmittedBy] = useState('');
  const [speciesGuessId, setSpeciesGuessId] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  function useCurrentLocation() {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: true },
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/projects/${projectSlug}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitted_by: submittedBy.trim(),
          species_guess_id: speciesGuessId || null,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao enviar');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="card max-w-md text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="font-display text-2xl font-bold text-verde-cerrado">
            Ocorrência enviada!
          </h2>
          <p className="text-gray-600">
            Sua submissão foi registrada e será analisada pela equipe técnica.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setStatus('idle');
                setSubmittedBy('');
                setSpeciesGuessId('');
                setLat('');
                setLng('');
                setNotes('');
              }}
              className="btn-secondary text-sm cursor-pointer"
            >
              Nova submissão
            </button>
            <a href={`/${projectSlug}/mapa`} className="btn-primary text-sm">
              Ver mapa
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 max-w-lg mx-auto w-full">
      <div className="card">
        <h2 className="font-display text-xl font-bold text-verde-cerrado mb-1">
          Reportar ocorrência
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Informe a localização e detalhes de uma árvore ou ocorrência.
          A equipe técnica revisará sua submissão.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="submittedBy" className="block text-sm font-medium text-gray-700 mb-1">
              Seu nome *
            </label>
            <input
              id="submittedBy"
              type="text"
              required
              value={submittedBy}
              onChange={e => setSubmittedBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
              placeholder="Maria Silva"
            />
          </div>

          <div>
            <label htmlFor="speciesGuess" className="block text-sm font-medium text-gray-700 mb-1">
              Espécie (se souber)
            </label>
            <select
              id="speciesGuess"
              value={speciesGuessId}
              onChange={e => setSpeciesGuessId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer"
            >
              <option value="">Não sei / Outra</option>
              {species.map(s => (
                <option key={s.id} value={s.id}>
                  {s.common_name} ({s.scientific_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Localização *
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="number"
                step="any"
                required
                value={lat}
                onChange={e => setLat(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
                placeholder="Latitude"
              />
              <input
                type="number"
                step="any"
                required
                value={lng}
                onChange={e => setLng(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
                placeholder="Longitude"
              />
            </div>
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={geoLoading}
              className="text-xs text-verde-medio hover:underline cursor-pointer disabled:opacity-50"
            >
              {geoLoading ? 'Obtendo localização...' : '📍 Usar minha localização atual'}
            </button>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50 resize-none"
              placeholder="Descreva o que observou..."
            />
          </div>

          {status === 'error' && (
            <div className="bg-terracota/10 text-terracota text-sm p-3 rounded-lg">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-primary w-full text-sm disabled:opacity-50 cursor-pointer"
          >
            {status === 'loading' ? 'Enviando...' : 'Enviar ocorrência'}
          </button>
        </form>
      </div>
    </div>
  );
}
