'use client';

import { useState, FormEvent } from 'react';

interface SpeciesOption {
  id: string;
  common_name: string;
  scientific_name: string;
}

interface EditData {
  id: string;
  species_id: string;
  lat: number;
  lng: number;
  dbh_cm: number | null;
  height_m: number | null;
  status: string;
  reliability: string;
  planted_date: string | null;
  qr_slug: string;
}

interface Props {
  projectSlug: string;
  species: SpeciesOption[];
  userRole: string;
  editData?: EditData;
}

const STATUSES = [
  { value: 'viva', label: 'Viva' },
  { value: 'doente', label: 'Doente' },
  { value: 'em_tratamento', label: 'Em tratamento' },
  { value: 'morta', label: 'Morta' },
  { value: 'removida', label: 'Removida' },
];

export default function TreeForm({ projectSlug, species, userRole, editData }: Props) {
  const isEdit = !!editData;

  const [speciesId, setSpeciesId] = useState(editData?.species_id ?? '');
  const [lat, setLat] = useState(editData?.lat.toString() ?? '');
  const [lng, setLng] = useState(editData?.lng.toString() ?? '');
  const [dbhCm, setDbhCm] = useState(editData?.dbh_cm?.toString() ?? '');
  const [heightM, setHeightM] = useState(editData?.height_m?.toString() ?? '');
  const [status, setStatus] = useState(editData?.status ?? 'viva');
  const [plantedDate, setPlantedDate] = useState(editData?.planted_date ?? '');
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [createdSlug, setCreatedSlug] = useState('');
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
    setFormStatus('loading');
    setErrorMsg('');

    const body = {
      species_id: speciesId,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      dbh_cm: dbhCm ? parseFloat(dbhCm) : null,
      height_m: heightM ? parseFloat(heightM) : null,
      status,
      planted_date: plantedDate || null,
      reliability: userRole === 'tecnico' ? 'validado_tecnico' : 'declarado_gestor',
    };

    try {
      const url = isEdit
        ? `/api/projects/${projectSlug}/trees?id=${editData.id}`
        : `/api/projects/${projectSlug}/trees`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar');
      }

      const data = await res.json();
      setCreatedSlug(data.qr_slug || editData?.qr_slug || '');
      setFormStatus('success');
    } catch (err) {
      setFormStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }

  if (formStatus === 'success') {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="card max-w-md text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="font-display text-2xl font-bold text-verde-cerrado">
            {isEdit ? 'Árvore atualizada!' : 'Árvore cadastrada!'}
          </h2>
          {createdSlug && (
            <p className="text-gray-600">
              Código: <span className="font-mono font-bold">{createdSlug}</span>
            </p>
          )}
          <div className="flex gap-3 justify-center">
            {!isEdit && (
              <button
                onClick={() => {
                  setFormStatus('idle');
                  setSpeciesId('');
                  setDbhCm('');
                  setHeightM('');
                  setPlantedDate('');
                  setCreatedSlug('');
                }}
                className="btn-secondary text-sm cursor-pointer"
              >
                Cadastrar outra
              </button>
            )}
            <a href={`/${projectSlug}/painel`} className="btn-primary text-sm">
              Voltar ao painel
            </a>
            {createdSlug && (
              <a href={`/arvore/${createdSlug}`} className="btn-primary text-sm bg-ocre hover:bg-ocre/80">
                Ver ficha
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 max-w-lg mx-auto w-full">
      <div className="card">
        <h2 className="font-display text-xl font-bold text-verde-cerrado mb-1">
          {isEdit ? 'Editar árvore' : 'Cadastrar árvore'}
        </h2>
        {isEdit && (
          <p className="text-sm text-gray-400 font-mono mb-4">{editData.qr_slug}</p>
        )}
        <p className="text-sm text-gray-500 mb-6">
          {isEdit
            ? 'Atualize os dados da árvore abaixo.'
            : 'Preencha os dados para cadastrar uma nova árvore no projeto.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-1">
              Espécie *
            </label>
            <select
              id="species"
              required
              value={speciesId}
              onChange={e => setSpeciesId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer"
            >
              <option value="">Selecione...</option>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dbh" className="block text-sm font-medium text-gray-700 mb-1">
                DAP (cm)
              </label>
              <input
                id="dbh"
                type="number"
                step="0.1"
                min="0"
                value={dbhCm}
                onChange={e => setDbhCm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
                placeholder="Ex: 15.5"
              />
            </div>
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                Altura (m)
              </label>
              <input
                id="height"
                type="number"
                step="0.1"
                min="0"
                value={heightM}
                onChange={e => setHeightM(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
                placeholder="Ex: 8.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="status"
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer"
              >
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="planted" className="block text-sm font-medium text-gray-700 mb-1">
                Data de plantio
              </label>
              <input
                id="planted"
                type="date"
                value={plantedDate}
                onChange={e => setPlantedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
              />
            </div>
          </div>

          {formStatus === 'error' && (
            <div className="bg-terracota/10 text-terracota text-sm p-3 rounded-lg">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={formStatus === 'loading'}
            className="btn-primary w-full text-sm disabled:opacity-50 cursor-pointer"
          >
            {formStatus === 'loading'
              ? 'Salvando...'
              : isEdit
                ? 'Salvar alterações'
                : 'Cadastrar árvore'}
          </button>
        </form>
      </div>
    </div>
  );
}
