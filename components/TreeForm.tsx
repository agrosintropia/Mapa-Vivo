'use client';

import { useState, useEffect, useRef, FormEvent, useMemo } from 'react';

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
  { value: 'viva', label: '🟢 Viva' },
  { value: 'doente', label: '🟡 Doente' },
  { value: 'em_tratamento', label: '🔵 Em tratamento' },
  { value: 'morta', label: '⚫ Morta' },
  { value: 'removida', label: '🔴 Removida' },
];

function normalize(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function TreeForm({ projectSlug, species, userRole, editData }: Props) {
  const isEdit = !!editData;

  const [speciesId, setSpeciesId] = useState(editData?.species_id ?? '');
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);
  const [lat, setLat] = useState(editData?.lat.toString() ?? '');
  const [lng, setLng] = useState(editData?.lng.toString() ?? '');
  const [dbhCm, setDbhCm] = useState(editData?.dbh_cm?.toString() ?? '');
  const [heightM, setHeightM] = useState(editData?.height_m?.toString() ?? '');
  const [status, setStatus] = useState(editData?.status ?? 'viva');
  const [plantedDate, setPlantedDate] = useState(editData?.planted_date ?? '');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [createdSlug, setCreatedSlug] = useState('');
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [treeCount, setTreeCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedSpecies = useMemo(
    () => species.find((s) => s.id === speciesId),
    [species, speciesId]
  );

  const filteredSpecies = useMemo(() => {
    if (!speciesSearch) return species;
    const q = normalize(speciesSearch);
    return species.filter(
      (s) =>
        normalize(s.common_name).includes(q) ||
        normalize(s.scientific_name).includes(q)
    );
  }, [species, speciesSearch]);

  // Auto GPS on mount
  useEffect(() => {
    if (!navigator.geolocation || isEdit) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!lat && !lng) {
          setLat(pos.coords.latitude.toFixed(6));
          setLng(pos.coords.longitude.toFixed(6));
        }
        setGpsActive(true);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isEdit, lat, lng]);

  function captureCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setGpsActive(true);
      },
      () => alert('Não foi possível obter a localização.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function selectSpecies(s: SpeciesOption) {
    setSpeciesId(s.id);
    setSpeciesSearch('');
    setShowSpeciesDropdown(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormStatus('loading');
    setErrorMsg('');

    let photoUrl: string | null = null;
    if (photo) {
      const reader = new FileReader();
      photoUrl = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(photo);
      });
    }

    const body = {
      species_id: speciesId,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      dbh_cm: dbhCm ? parseFloat(dbhCm) : null,
      height_m: heightM ? parseFloat(heightM) : null,
      status,
      planted_date: plantedDate || null,
      reliability: userRole === 'tecnico' ? 'validado_tecnico' : 'declarado_gestor',
      photo_url: photoUrl,
      notes: notes || null,
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
      setTreeCount((c) => c + 1);
      setFormStatus('success');
    } catch (err) {
      setFormStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }

  function resetForNext() {
    setFormStatus('idle');
    setSpeciesId('');
    setSpeciesSearch('');
    setDbhCm('');
    setHeightM('');
    setPlantedDate('');
    setNotes('');
    setPhoto(null);
    setPhotoPreview(null);
    setCreatedSlug('');
    setErrorMsg('');
    // Keep lat/lng — the technician is likely still in the same area
    // Capture fresh GPS
    captureCurrentLocation();
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
              Código: <span className="font-mono font-bold text-lg">{createdSlug}</span>
            </p>
          )}
          {treeCount > 0 && !isEdit && (
            <p className="text-sm text-gray-400">{treeCount} árvore{treeCount > 1 ? 's' : ''} cadastrada{treeCount > 1 ? 's' : ''} nesta sessão</p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!isEdit && (
              <button onClick={resetForNext} className="btn-primary text-sm cursor-pointer">
                + Cadastrar próxima
              </button>
            )}
            <a href={`/${projectSlug}/painel`} className="btn-secondary text-sm text-center">
              Voltar ao painel
            </a>
            {createdSlug && (
              <a href={`/arvore/${createdSlug}`} className="bg-ocre text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm text-center">
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
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-xl font-bold text-verde-cerrado">
            {isEdit ? 'Editar árvore' : 'Cadastrar árvore'}
          </h2>
          {gpsActive && (
            <span className="flex items-center gap-1 text-xs text-verde-medio">
              <span className="w-2 h-2 bg-verde-medio rounded-full animate-pulse" />
              GPS {gpsAccuracy ? `(±${gpsAccuracy}m)` : ''}
            </span>
          )}
        </div>
        {isEdit && (
          <p className="text-sm text-gray-400 font-mono mb-4">{editData.qr_slug}</p>
        )}
        {!isEdit && treeCount > 0 && (
          <p className="text-xs text-verde-medio mb-4">{treeCount} cadastrada{treeCount > 1 ? 's' : ''} nesta sessão</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Species search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Espécie *</label>
            {selectedSpecies && !showSpeciesDropdown ? (
              <div className="flex items-center justify-between bg-verde-claro/20 border-2 border-verde-medio rounded-lg px-3 py-2">
                <div>
                  <p className="font-medium text-sm text-verde-cerrado">{selectedSpecies.common_name}</p>
                  <p className="text-xs text-gray-500 italic">{selectedSpecies.scientific_name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSpeciesId(''); setShowSpeciesDropdown(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
                  className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={speciesSearch}
                  onChange={(e) => { setSpeciesSearch(e.target.value); setShowSpeciesDropdown(true); }}
                  onFocus={() => setShowSpeciesDropdown(true)}
                  placeholder="Buscar por nome comum ou científico..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
                />
                {showSpeciesDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredSpecies.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-gray-400">Nenhuma espécie encontrada</p>
                    ) : (
                      filteredSpecies.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => selectSpecies(s)}
                          className="w-full text-left px-3 py-2 hover:bg-verde-claro/20 transition-colors cursor-pointer"
                        >
                          <p className="text-sm font-medium">{s.common_name}</p>
                          <p className="text-xs text-gray-500 italic">{s.scientific_name}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto da árvore</label>
            {photoPreview ? (
              <div className="relative inline-block">
                <img src={photoPreview} alt="Foto" className="w-32 h-32 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center gap-2 text-gray-400 hover:border-verde-medio hover:text-verde-medio transition-colors cursor-pointer"
              >
                <span className="text-3xl">📷</span>
                <span className="text-sm">Tirar foto ou escolher do álbum</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Localização *</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="number"
                step="any"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
                placeholder="Latitude"
              />
              <input
                type="number"
                step="any"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
                placeholder="Longitude"
              />
            </div>
            <button
              type="button"
              onClick={captureCurrentLocation}
              className="text-xs text-verde-medio hover:underline cursor-pointer flex items-center gap-1"
            >
              📍 Atualizar localização GPS
              {gpsActive && <span className="text-gray-400">(atualizado automaticamente)</span>}
            </button>
          </div>

          {/* Measurements */}
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
                onChange={(e) => setDbhCm(e.target.value)}
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
                onChange={(e) => setHeightM(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
                placeholder="Ex: 8.0"
              />
            </div>
          </div>

          {/* Status and date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer"
              >
                {STATUSES.map((s) => (
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
                onChange={(e) => setPlantedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Estado fitossanitário, características visuais, localização de referência..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
            />
          </div>

          {/* Reliability indicator */}
          <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 flex items-center gap-2">
            {userRole === 'tecnico' ? (
              <><span className="text-verde-cerrado font-medium">✓ Validado por técnico</span> — confiabilidade máxima</>
            ) : (
              <><span className="text-blue-600 font-medium">ℹ Declarado pelo gestor</span> — aguardando validação técnica</>
            )}
          </div>

          {formStatus === 'error' && (
            <div className="bg-terracota/10 text-terracota text-sm p-3 rounded-lg">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={formStatus === 'loading' || !speciesId}
            className="btn-primary w-full text-sm disabled:opacity-50 cursor-pointer"
          >
            {formStatus === 'loading'
              ? 'Salvando...'
              : isEdit
                ? 'Salvar alterações'
                : '🌳 Cadastrar árvore'}
          </button>
        </form>
      </div>
    </div>
  );
}
