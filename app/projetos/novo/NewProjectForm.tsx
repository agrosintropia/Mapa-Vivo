'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ProjectMapPreview = dynamic(() => import('./ProjectMapPreview'), { ssr: false });

interface SubAreaInput {
  id: string;
  name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  boundary: any;
  area_hectares: string;
}

const PROJECT_TYPES = [
  { value: 'condominio', label: 'Condomínio' },
  { value: 'parque', label: 'Parque' },
  { value: 'agrofloresta', label: 'Agrofloresta' },
  { value: 'incorporadora', label: 'Incorporadora' },
];

const BIOMES = [
  'Cerrado', 'Mata Atlântica', 'Amazônia', 'Caatinga', 'Pampa', 'Pantanal',
];

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

export default function NewProjectForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Basic info
  const [name, setName] = useState('');
  const [type, setType] = useState('condominio');
  const [city, setCity] = useState('');
  const [state, setState] = useState('GO');
  const [biome, setBiome] = useState('Cerrado');
  const [description, setDescription] = useState('');

  // Step 2: Area/boundary
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [boundary, setBoundary] = useState<any>(null);
  const [areaHectares, setAreaHectares] = useState('');
  const [fileName, setFileName] = useState('');

  // Step 3: Sub-areas
  const [subAreas, setSubAreas] = useState<SubAreaInput[]>([]);
  const [addingSubArea, setAddingSubArea] = useState(false);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const ext = file.name.toLowerCase().split('.').pop();

    try {
      const { parseKmlString, parseKmzBuffer } = await import('@/lib/kml-parser');

      let result;
      if (ext === 'kmz') {
        const buffer = await file.arrayBuffer();
        result = await parseKmzBuffer(buffer);
      } else if (ext === 'kml') {
        const text = await file.text();
        result = await parseKmlString(text);
      } else {
        setError('Formato não suportado. Use .kml ou .kmz');
        return;
      }

      if (result.boundary) {
        setBoundary(result.boundary);
        if (result.area_hectares) {
          setAreaHectares(result.area_hectares.toString());
        }
        setError('');
      } else {
        setError('Nenhum polígono encontrado no arquivo. Verifique se o KML contém uma área delimitada.');
      }
    } catch (err) {
      console.error('Erro ao processar arquivo:', err);
      setError('Erro ao processar o arquivo. Verifique se é um KML/KMZ válido.');
    }
  }, []);

  const addSubArea = useCallback(() => {
    setSubAreas(prev => [...prev, {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      boundary: null,
      area_hectares: '',
    }]);
    setAddingSubArea(true);
  }, []);

  const updateSubArea = useCallback((id: string, field: keyof SubAreaInput, value: string) => {
    setSubAreas(prev => prev.map(sa =>
      sa.id === id ? { ...sa, [field]: value } : sa
    ));
  }, []);

  const removeSubArea = useCallback((id: string) => {
    setSubAreas(prev => prev.filter(sa => sa.id !== id));
  }, []);

  const handleSubAreaFile = useCallback(async (id: string, file: File) => {
    const ext = file.name.toLowerCase().split('.').pop();
    try {
      const { parseKmlString, parseKmzBuffer } = await import('@/lib/kml-parser');
      let result;
      if (ext === 'kmz') {
        result = await parseKmzBuffer(await file.arrayBuffer());
      } else {
        result = await parseKmlString(await file.text());
      }
      if (result.boundary) {
        setSubAreas(prev => prev.map(sa =>
          sa.id === id ? {
            ...sa,
            boundary: result.boundary,
            area_hectares: result.area_hectares?.toString() || sa.area_hectares,
          } : sa
        ));
      }
    } catch {
      setError('Erro ao processar arquivo da sub-área');
    }
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    setError('');

    try {
      const payload = {
        name,
        type,
        city,
        state,
        biome,
        description: description || null,
        boundary,
        area_hectares: areaHectares || null,
        sub_areas: subAreas
          .filter(sa => sa.name.trim())
          .map(sa => ({
            name: sa.name,
            description: sa.description || null,
            boundary: sa.boundary,
            area_hectares: sa.area_hectares || null,
          })),
      };

      const res = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao criar projeto');
      }

      const { slug } = await res.json();
      router.push(`/${slug}/visita`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar projeto');
    } finally {
      setSaving(false);
    }
  };

  const canAdvanceStep1 = name.trim() && city.trim();
  const canAdvanceStep2 = true;

  return (
    <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => s < step && setStep(s)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors cursor-pointer ${
                s === step ? 'bg-verde-cerrado text-white' :
                s < step ? 'bg-verde-medio text-white' :
                'bg-gray-200 text-gray-400'
              }`}
            >
              {s < step ? '✓' : s}
            </button>
            {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-verde-medio' : 'bg-gray-200'}`} />}
          </div>
        ))}
        <span className="ml-3 text-sm text-gray-500">
          {step === 1 && 'Informações básicas'}
          {step === 2 && 'Área do projeto'}
          {step === 3 && 'Sub-áreas (opcional)'}
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Basic info */}
      {step === 1 && (
        <div className="card space-y-4">
          <h2 className="font-display text-xl font-bold text-verde-cerrado">Informações do Projeto</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do projeto *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Residencial Mata Viva"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <div className="grid grid-cols-2 gap-2">
              {PROJECT_TYPES.map(pt => (
                <button
                  key={pt.value}
                  onClick={() => setType(pt.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                    type === pt.value
                      ? 'border-verde-cerrado bg-verde-cerrado/10 text-verde-cerrado'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Ex: Goiânia"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer"
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bioma *</label>
            <select
              value={biome}
              onChange={e => setBiome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer"
            >
              {BIOMES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Descrição do local, contexto do mapeamento..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50 resize-none"
            />
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!canAdvanceStep1}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo: Definir área
          </button>
        </div>
      )}

      {/* Step 2: Area/boundary */}
      {step === 2 && (
        <div className="card space-y-4">
          <h2 className="font-display text-xl font-bold text-verde-cerrado">Área do Projeto</h2>
          <p className="text-sm text-gray-500">
            Faça upload de um arquivo KML ou KMZ com o perímetro da área total do projeto.
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-verde-medio transition-colors">
            <input
              type="file"
              accept=".kml,.kmz"
              onChange={handleFileUpload}
              className="hidden"
              id="kml-upload"
            />
            <label htmlFor="kml-upload" className="cursor-pointer">
              <div className="text-3xl mb-2">📂</div>
              {fileName ? (
                <p className="text-sm text-verde-cerrado font-medium">{fileName}</p>
              ) : (
                <p className="text-sm text-gray-500">
                  Clique para selecionar arquivo <strong>.kml</strong> ou <strong>.kmz</strong>
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Exportado do Google Earth, Google Maps ou outro software GIS
              </p>
            </label>
          </div>

          {boundary && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-verde-cerrado font-medium">
                <span>✓</span> Área carregada com sucesso
              </div>
              <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
                <ProjectMapPreview boundary={boundary} subAreas={[]} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área total (hectares)
            </label>
            <input
              type="number"
              step="0.01"
              value={areaHectares}
              onChange={e => setAreaHectares(e.target.value)}
              placeholder="Calculado automaticamente ou informe manualmente"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">
              Voltar
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canAdvanceStep2}
              className="btn-primary flex-1"
            >
              Próximo: Sub-áreas
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Sub-areas */}
      {step === 3 && (
        <div className="card space-y-4">
          <h2 className="font-display text-xl font-bold text-verde-cerrado">Sub-áreas do Projeto</h2>
          <p className="text-sm text-gray-500">
            Opcional: divida o projeto em áreas distintas (ex: Parque da Represa, Pomar Agroflorestal, Mata do Fundo).
          </p>

          {boundary && (
            <div className="h-48 rounded-lg overflow-hidden border border-gray-200">
              <ProjectMapPreview
                boundary={boundary}
                subAreas={subAreas.filter(sa => sa.boundary).map(sa => ({
                  name: sa.name,
                  boundary: sa.boundary,
                }))}
              />
            </div>
          )}

          {subAreas.map((sa, idx) => (
            <div key={sa.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-verde-cerrado">Sub-área {idx + 1}</span>
                <button
                  onClick={() => removeSubArea(sa.id)}
                  className="text-red-400 hover:text-red-600 text-sm cursor-pointer"
                >
                  Remover
                </button>
              </div>
              <input
                type="text"
                value={sa.name}
                onChange={e => updateSubArea(sa.id, 'name', e.target.value)}
                placeholder="Nome da sub-área (ex: Pomar Agroflorestal)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
              />
              <textarea
                value={sa.description}
                onChange={e => updateSubArea(sa.id, 'description', e.target.value)}
                placeholder="Descrição (opcional)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50 resize-none"
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">KML/KMZ da sub-área (opcional)</label>
                  <input
                    type="file"
                    accept=".kml,.kmz"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleSubAreaFile(sa.id, file);
                    }}
                    className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-verde-medio/10 file:text-verde-medio file:cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Hectares</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sa.area_hectares}
                    onChange={e => updateSubArea(sa.id, 'area_hectares', e.target.value)}
                    placeholder="—"
                    className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
                  />
                </div>
              </div>
              {sa.boundary && (
                <p className="text-xs text-verde-cerrado">✓ Perímetro carregado</p>
              )}
            </div>
          ))}

          <button
            onClick={addSubArea}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-verde-medio hover:text-verde-medio transition-colors cursor-pointer"
          >
            + Adicionar sub-área
          </button>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">
              Voltar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {saving ? 'Criando projeto...' : 'Criar Projeto'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
