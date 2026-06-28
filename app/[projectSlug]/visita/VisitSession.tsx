'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface TreeItem {
  id: string;
  lat: number;
  lng: number;
  status: string;
  qr_slug: string;
  dbh_cm: number | null;
  height_m: number | null;
  species: { id: string; common_name: string; scientific_name: string };
}

interface SpeciesItem {
  id: string;
  common_name: string;
  scientific_name: string;
  family: string;
  strata: string;
  description: string | null;
  ecological_function: string | null;
  fruiting_season: string | null;
  fauna_attracted: string | null;
  subclasses: string[];
}

interface ActionLog {
  type: string;
  summary: string;
  time: string;
}

type Panel = 'inicio' | 'sessao' | 'adicionar' | 'nova_especie' | 'editar_arvore' | 'remover' | 'editar_especie' | 'adicionar_subarea' | 'finalizar';

const STATUS_OPTS = [
  { value: 'viva', label: 'Viva' },
  { value: 'doente', label: 'Doente' },
  { value: 'em_tratamento', label: 'Em tratamento' },
  { value: 'morta', label: 'Morta' },
];

export default function VisitSession({
  project,
  trees: initialTrees,
  species,
  userName,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project: { id: string; name: string; slug: string; boundary: any };
  trees: TreeItem[];
  species: SpeciesItem[];
  userName: string;
}) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>('inicio');
  const [visitId, setVisitId] = useState<string | null>(null);
  const [purpose, setPurpose] = useState('');
  const [actions, setActions] = useState<ActionLog[]>([]);
  const [trees, setTrees] = useState(initialTrees);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [finishNotes, setFinishNotes] = useState('');

  // Add tree form
  const [addSpeciesSearch, setAddSpeciesSearch] = useState('');
  const [addSpeciesId, setAddSpeciesId] = useState('');
  const [addLat, setAddLat] = useState('');
  const [addLng, setAddLng] = useState('');
  const [addDbh, setAddDbh] = useState('');
  const [addHeight, setAddHeight] = useState('');
  const [addStatus, setAddStatus] = useState('viva');
  const [addNotes, setAddNotes] = useState('');
  const [addCount, setAddCount] = useState(0);
  const [lastAdded, setLastAdded] = useState('');

  // Edit tree
  const [editTreeId, setEditTreeId] = useState('');
  const [editDbh, setEditDbh] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editSpeciesId, setEditSpeciesId] = useState('');

  // Remove tree
  const [removeTreeId, setRemoveTreeId] = useState('');
  const [removeReason, setRemoveReason] = useState('');

  // Edit species
  const [editSpecId, setEditSpecId] = useState('');
  const [editSpecCommon, setEditSpecCommon] = useState('');
  const [editSpecScientific, setEditSpecScientific] = useState('');
  const [editSpecFamily, setEditSpecFamily] = useState('');
  const [editSpecDescription, setEditSpecDescription] = useState('');

  // New species form
  const [speciesList, setSpeciesList] = useState(species);
  const [newSpecCommon, setNewSpecCommon] = useState('');
  const [newSpecScientific, setNewSpecScientific] = useState('');
  const [newSpecFamily, setNewSpecFamily] = useState('');
  const [newSpecStrata, setNewSpecStrata] = useState('medio');
  const [newSpecUnidentified, setNewSpecUnidentified] = useState(false);

  // Add sub-area
  const [saName, setSaName] = useState('');
  const [saDescription, setSaDescription] = useState('');

  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const filteredSpecies = addSpeciesSearch.length > 1
    ? speciesList.filter(s =>
        normalize(s.common_name).includes(normalize(addSpeciesSearch)) ||
        normalize(s.scientific_name).includes(normalize(addSpeciesSearch))
      ).slice(0, 8)
    : [];

  const showNewSpeciesOption = addSpeciesSearch.length > 1 && !addSpeciesId && filteredSpecies.length < 3;

  const handleCreateSpecies = async () => {
    if (!newSpecCommon.trim() && !newSpecUnidentified) { setError('Nome popular obrigatório'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/species', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          common_name: newSpecUnidentified ? 'Não identificada' : newSpecCommon,
          scientific_name: newSpecUnidentified ? 'Não identificada' : (newSpecScientific || 'Não identificada'),
          family: newSpecFamily || 'Não identificada',
          strata: newSpecStrata,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const newSpec: SpeciesItem = {
        id: data.id,
        common_name: data.common_name,
        scientific_name: data.scientific_name,
        family: newSpecFamily || 'Não identificada',
        strata: newSpecStrata,
        description: null,
        ecological_function: null,
        fruiting_season: null,
        fauna_attracted: null,
        subclasses: [],
      };
      setSpeciesList(prev => [...prev, newSpec]);
      setAddSpeciesId(data.id);
      setAddSpeciesSearch(data.common_name);
      setActions(prev => [...prev, {
        type: 'adicao_especie',
        summary: `Nova espécie: ${data.common_name}`,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }]);

      setNewSpecCommon(''); setNewSpecScientific(''); setNewSpecFamily('');
      setNewSpecStrata('medio'); setNewSpecUnidentified(false);
      setPanel('adicionar');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar espécie');
    } finally {
      setLoading(false);
    }
  };

  const startVisit = async () => {
    if (!purpose.trim()) { setError('Informe a finalidade da visita'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/projects/${project.slug}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVisitId(data.id);
      setPanel('sessao');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao iniciar visita');
    } finally {
      setLoading(false);
    }
  };

  const doAction = useCallback(async (body: Record<string, unknown>) => {
    if (!visitId) return null;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/visits/${visitId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro');
      return null;
    } finally {
      setLoading(false);
    }
  }, [visitId]);

  const handleAddTree = async (continueAdding: boolean) => {
    if (!addSpeciesId || !addLat || !addLng) { setError('Espécie e coordenadas obrigatórias'); return; }
    const result = await doAction({
      action_type: 'adicao_arvore',
      species_id: addSpeciesId,
      lat: parseFloat(addLat),
      lng: parseFloat(addLng),
      dbh_cm: addDbh ? parseFloat(addDbh) : null,
      height_m: addHeight ? parseFloat(addHeight) : null,
      status: addStatus,
      notes: addNotes || null,
    });
    if (result) {
      const sp = species.find(s => s.id === addSpeciesId);
      setActions(prev => [...prev, { type: 'adicao_arvore', summary: `+ ${sp?.common_name || 'árvore'}`, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
      setTrees(prev => [...prev, {
        id: result.tree_id,
        lat: parseFloat(addLat), lng: parseFloat(addLng),
        status: addStatus, qr_slug: result.qr_slug,
        dbh_cm: addDbh ? parseFloat(addDbh) : null,
        height_m: addHeight ? parseFloat(addHeight) : null,
        species: { id: addSpeciesId, common_name: sp?.common_name || '', scientific_name: sp?.scientific_name || '' },
      }]);
      setAddCount(prev => prev + 1);
      setLastAdded(sp?.common_name || 'árvore');

      // Reset form but keep GPS for continuous field work
      setAddSpeciesSearch(''); setAddSpeciesId(''); setAddDbh(''); setAddHeight('');
      setAddStatus('viva'); setAddNotes('');

      if (continueAdding) {
        useGPS(setAddLat, setAddLng);
      } else {
        setAddLat(''); setAddLng('');
        setPanel('sessao');
      }
    }
  };

  const handleEditTree = async () => {
    if (!editTreeId) return;
    const changes: Record<string, unknown> = {};
    if (editDbh) changes.dbh_cm = parseFloat(editDbh);
    if (editHeight) changes.height_m = parseFloat(editHeight);
    if (editStatus) changes.status = editStatus;
    if (editSpeciesId) changes.species_id = editSpeciesId;

    const result = await doAction({ action_type: 'edicao_arvore', tree_id: editTreeId, changes });
    if (result) {
      const tree = trees.find(t => t.id === editTreeId);
      setActions(prev => [...prev, { type: 'edicao_arvore', summary: `Editada: ${tree?.species.common_name} (${tree?.qr_slug})`, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
      setTrees(prev => prev.map(t => t.id === editTreeId ? {
        ...t,
        dbh_cm: editDbh ? parseFloat(editDbh) : t.dbh_cm,
        height_m: editHeight ? parseFloat(editHeight) : t.height_m,
        status: editStatus || t.status,
      } : t));
      setPanel('sessao');
    }
  };

  const handleRemoveTree = async () => {
    if (!removeTreeId) return;
    const result = await doAction({ action_type: 'remocao_arvore', tree_id: removeTreeId, reason: removeReason });
    if (result) {
      const tree = trees.find(t => t.id === removeTreeId);
      setActions(prev => [...prev, { type: 'remocao_arvore', summary: `- ${tree?.species.common_name} (${tree?.qr_slug})`, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
      setTrees(prev => prev.filter(t => t.id !== removeTreeId));
      setRemoveTreeId(''); setRemoveReason('');
      setPanel('sessao');
    }
  };

  const handleEditSpecies = async () => {
    if (!editSpecId) return;
    const changes: Record<string, string> = {};
    if (editSpecCommon) changes.common_name = editSpecCommon;
    if (editSpecScientific) changes.scientific_name = editSpecScientific;
    if (editSpecFamily) changes.family = editSpecFamily;
    if (editSpecDescription) changes.description = editSpecDescription;

    const result = await doAction({ action_type: 'edicao_especie', species_id: editSpecId, changes });
    if (result) {
      const sp = species.find(s => s.id === editSpecId);
      setActions(prev => [...prev, { type: 'edicao_especie', summary: `Espécie editada: ${sp?.common_name}`, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
      setPanel('sessao');
    }
  };

  const handleAddSubArea = async () => {
    if (!saName.trim()) { setError('Nome da sub-área obrigatório'); return; }
    const result = await doAction({ action_type: 'adicao_subarea', name: saName, description: saDescription });
    if (result) {
      setActions(prev => [...prev, { type: 'adicao_subarea', summary: `Sub-área: ${saName}`, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
      setSaName(''); setSaDescription('');
      setPanel('sessao');
    }
  };

  const finishVisit = async () => {
    if (!visitId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/visits/${visitId}/finish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: finishNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPanel('finalizar');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao finalizar');
    } finally {
      setLoading(false);
    }
  };

  const useGPS = (setLat: (v: string) => void, setLng: (v: string) => void) => {
    navigator.geolocation.getCurrentPosition(
      pos => { setLat(pos.coords.latitude.toFixed(6)); setLng(pos.coords.longitude.toFixed(6)); },
      () => setError('GPS indisponível'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const selectTreeForEdit = (tree: TreeItem) => {
    setEditTreeId(tree.id);
    setEditDbh(tree.dbh_cm?.toString() || '');
    setEditHeight(tree.height_m?.toString() || '');
    setEditStatus(tree.status);
    setEditSpeciesId(tree.species.id);
    setPanel('editar_arvore');
  };

  const selectTreeForRemove = (tree: TreeItem) => {
    setRemoveTreeId(tree.id);
    setRemoveReason('');
    setPanel('remover');
  };

  const selectSpeciesForEdit = (sp: SpeciesItem) => {
    setEditSpecId(sp.id);
    setEditSpecCommon(sp.common_name);
    setEditSpecScientific(sp.scientific_name);
    setEditSpecFamily(sp.family);
    setEditSpecDescription(sp.description || '');
    setPanel('editar_especie');
  };

  return (
    <main className="min-h-screen bg-areia flex flex-col">
      <header className="bg-verde-cerrado text-white px-4 py-3 flex items-center justify-between shadow-md z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">🔬</span>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight">{project.name}</h1>
            <p className="text-xs opacity-70">
              {visitId ? 'Visita Técnica em andamento' : 'Iniciar Visita Técnica'}
            </p>
          </div>
        </div>
        {!visitId && (
          <a href={`/${project.slug}/painel`} className="text-sm hover:underline opacity-80">Voltar</a>
        )}
      </header>

      <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <button onClick={() => setError('')} className="ml-2 font-bold cursor-pointer">×</button>
          </div>
        )}

        {/* START: purpose input */}
        {panel === 'inicio' && (
          <div className="card space-y-4">
            <h2 className="font-display text-xl font-bold text-verde-cerrado">Iniciar Visita Técnica</h2>
            <p className="text-sm text-gray-500">
              Todas as alterações feitas durante a visita serão registradas automaticamente.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
              <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">{userName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Finalidade da visita *</label>
              <input
                type="text"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder="Ex: Inventário inicial, Revisão semestral, Avaliação fitossanitária..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
              />
            </div>
            <button onClick={startVisit} disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Iniciando...' : 'Iniciar Visita'}
            </button>
          </div>
        )}

        {/* SESSION: main actions */}
        {panel === 'sessao' && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-bold text-verde-cerrado">Sessão Ativa</h2>
                <span className="text-xs bg-ocre/10 text-ocre px-2 py-1 rounded-full font-medium animate-pulse">Em andamento</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{purpose} &middot; {userName}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button onClick={() => { setPanel('adicionar'); setLastAdded(''); useGPS(setAddLat, setAddLng); }} className="p-4 border-2 border-dashed border-green-300 rounded-lg text-center hover:bg-green-50 transition-colors cursor-pointer">
                  <span className="text-2xl block mb-1">🌱</span>
                  <span className="text-sm font-medium text-green-700">Adicionar árvore</span>
                </button>
                <button onClick={() => setPanel('editar_arvore')} className="p-4 border-2 border-dashed border-blue-300 rounded-lg text-center hover:bg-blue-50 transition-colors cursor-pointer">
                  <span className="text-2xl block mb-1">✏️</span>
                  <span className="text-sm font-medium text-blue-700">Editar árvore</span>
                </button>
                <button onClick={() => setPanel('remover')} className="p-4 border-2 border-dashed border-red-300 rounded-lg text-center hover:bg-red-50 transition-colors cursor-pointer">
                  <span className="text-2xl block mb-1">🗑️</span>
                  <span className="text-sm font-medium text-red-700">Remover árvore</span>
                </button>
                <button onClick={() => setPanel('editar_especie')} className="p-4 border-2 border-dashed border-purple-300 rounded-lg text-center hover:bg-purple-50 transition-colors cursor-pointer">
                  <span className="text-2xl block mb-1">🔬</span>
                  <span className="text-sm font-medium text-purple-700">Editar espécie</span>
                </button>
                <button onClick={() => setPanel('adicionar_subarea')} className="p-4 border-2 border-dashed border-orange-300 rounded-lg text-center hover:bg-orange-50 transition-colors cursor-pointer">
                  <span className="text-2xl block mb-1">📐</span>
                  <span className="text-sm font-medium text-orange-700">Nova sub-área</span>
                </button>
              </div>
            </div>

            {/* Action log */}
            <div className="card">
              <h3 className="font-display text-base font-bold text-verde-cerrado mb-2">
                Registro da visita ({actions.length} ações)
              </h3>
              {actions.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhuma ação realizada ainda.</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {actions.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-300 text-xs">{a.time}</span>
                      <span className={
                        a.type === 'adicao_arvore' ? 'text-green-600' :
                        a.type === 'remocao_arvore' ? 'text-red-600' :
                        a.type === 'edicao_arvore' ? 'text-blue-600' :
                        a.type === 'edicao_especie' ? 'text-purple-600' : 'text-orange-600'
                      }>{a.summary}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trees list (compact) */}
            <div className="card">
              <h3 className="font-display text-base font-bold text-verde-cerrado mb-2">
                Árvores do projeto ({trees.length})
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {trees.map(t => (
                  <div key={t.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-verde-cerrado">{t.species.common_name}</span>
                      <span className="text-gray-400 ml-2 text-xs">{t.qr_slug}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => selectTreeForEdit(t)} className="text-blue-500 hover:underline text-xs cursor-pointer">Editar</button>
                      <button onClick={() => selectTreeForRemove(t)} className="text-red-400 hover:underline text-xs cursor-pointer">Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm('Deseja finalizar a visita técnica?')) finishVisit();
              }}
              disabled={loading}
              className="w-full bg-terracota text-white px-6 py-3 rounded-lg font-semibold hover:bg-terracota/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              Finalizar Visita
            </button>
          </div>
        )}

        {/* ADD TREE */}
        {panel === 'adicionar' && (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-green-700">Adicionar Árvore</h2>
              <div className="flex items-center gap-3">
                {addCount > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    {addCount} cadastradas
                  </span>
                )}
                <button onClick={() => setPanel('sessao')} className="text-sm text-gray-500 hover:underline cursor-pointer">Voltar</button>
              </div>
            </div>

            {lastAdded && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
                <span>✓</span> <strong>{lastAdded}</strong> cadastrada com sucesso!
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Espécie *</label>
              <input
                type="text"
                value={addSpeciesSearch}
                onChange={e => { setAddSpeciesSearch(e.target.value); setAddSpeciesId(''); }}
                placeholder="Buscar espécie..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
              />
              {filteredSpecies.length > 0 && !addSpeciesId && (
                <div className="mt-1 border border-gray-200 rounded-lg bg-white max-h-40 overflow-y-auto">
                  {filteredSpecies.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setAddSpeciesId(s.id); setAddSpeciesSearch(s.common_name); }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm cursor-pointer border-b border-gray-50"
                    >
                      <span className="font-medium">{s.common_name}</span>
                      <span className="text-gray-400 ml-2 italic text-xs">{s.scientific_name}</span>
                    </button>
                  ))}
                </div>
              )}
              {addSpeciesId && <p className="text-xs text-verde-cerrado mt-1">✓ Espécie selecionada</p>}
              {showNewSpeciesOption && !addSpeciesId && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => { setNewSpecCommon(addSpeciesSearch); setNewSpecUnidentified(false); setPanel('nova_especie'); }}
                    className="text-sm text-purple-600 hover:underline cursor-pointer font-medium"
                  >
                    + Cadastrar nova espécie
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => { setNewSpecUnidentified(true); setPanel('nova_especie'); }}
                    className="text-sm text-ocre hover:underline cursor-pointer font-medium"
                  >
                    ? Espécie não identificada
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                <input type="number" step="any" value={addLat} onChange={e => setAddLat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                <input type="number" step="any" value={addLng} onChange={e => setAddLng(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50" />
              </div>
            </div>
            <button type="button" onClick={() => useGPS(setAddLat, setAddLng)}
              className="text-sm text-blue-600 hover:underline cursor-pointer">
              📍 Usar minha localização GPS
            </button>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DAP (cm)</label>
                <input type="number" step="0.1" value={addDbh} onChange={e => setAddDbh(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Altura (m)</label>
                <input type="number" step="0.1" value={addHeight} onChange={e => setAddHeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select value={addStatus} onChange={e => setAddStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer">
                  {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea value={addNotes} onChange={e => setAddNotes(e.target.value)} rows={2}
                placeholder="Notas sobre a árvore..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50 resize-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => handleAddTree(false)} disabled={loading || !addSpeciesId} className="btn-secondary flex-1 disabled:opacity-50">
                {loading ? 'Salvando...' : 'Salvar e voltar'}
              </button>
              <button onClick={() => handleAddTree(true)} disabled={loading || !addSpeciesId} className="btn-primary flex-1 disabled:opacity-50">
                {loading ? 'Salvando...' : 'Salvar e cadastrar próxima'}
              </button>
            </div>
          </div>
        )}

        {/* NEW SPECIES */}
        {panel === 'nova_especie' && (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-purple-700">
                {newSpecUnidentified ? 'Espécie Não Identificada' : 'Cadastrar Nova Espécie'}
              </h2>
              <button onClick={() => setPanel('adicionar')} className="text-sm text-gray-500 hover:underline cursor-pointer">Voltar</button>
            </div>

            {newSpecUnidentified ? (
              <div className="bg-ocre/10 border border-ocre/30 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-700">
                  A árvore será cadastrada como <strong>&quot;Não identificada&quot;</strong>.
                </p>
                <p className="text-xs text-gray-500">
                  Moradores que conhecerem a espécie poderão sugerir a identificação via observação.
                  O gestor ou técnico validará a sugestão posteriormente.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome popular *</label>
                  <input type="text" value={newSpecCommon} onChange={e => setNewSpecCommon(e.target.value)}
                    placeholder="Ex: Ipê-amarelo, Jatobá..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome científico</label>
                  <input type="text" value={newSpecScientific} onChange={e => setNewSpecScientific(e.target.value)}
                    placeholder="Ex: Handroanthus albus"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50" />
                  <p className="text-xs text-gray-400 mt-1">Deixe em branco se não souber</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Família</label>
                    <input type="text" value={newSpecFamily} onChange={e => setNewSpecFamily(e.target.value)}
                      placeholder="Ex: Bignoniaceae"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estrato</label>
                    <select value={newSpecStrata} onChange={e => setNewSpecStrata(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer">
                      <option value="emergente">Emergente</option>
                      <option value="alto">Alto</option>
                      <option value="medio">Médio</option>
                      <option value="baixo">Baixo</option>
                      <option value="arbustivo">Arbustivo</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <button onClick={handleCreateSpecies} disabled={loading || (!newSpecUnidentified && !newSpecCommon.trim())}
              className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Cadastrando...' : newSpecUnidentified ? 'Cadastrar como não identificada' : 'Cadastrar espécie e continuar'}
            </button>
          </div>
        )}

        {/* EDIT TREE */}
        {panel === 'editar_arvore' && (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-blue-700">Editar Árvore</h2>
              <button onClick={() => setPanel('sessao')} className="text-sm text-gray-500 hover:underline cursor-pointer">Voltar</button>
            </div>

            {!editTreeId ? (
              <div className="space-y-1 max-h-80 overflow-y-auto">
                <p className="text-sm text-gray-500 mb-2">Selecione a árvore para editar:</p>
                {trees.map(t => (
                  <button
                    key={t.id}
                    onClick={() => selectTreeForEdit(t)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm cursor-pointer border-b border-gray-100 flex justify-between"
                  >
                    <span><strong>{t.species.common_name}</strong> <span className="text-gray-400 text-xs">{t.qr_slug}</span></span>
                    <span className="text-xs text-gray-400">{t.status}</span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  Editando: <strong>{trees.find(t => t.id === editTreeId)?.species.common_name}</strong>{' '}
                  ({trees.find(t => t.id === editTreeId)?.qr_slug})
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DAP (cm)</label>
                    <input type="number" step="0.1" value={editDbh} onChange={e => setEditDbh(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Altura (m)</label>
                    <input type="number" step="0.1" value={editHeight} onChange={e => setEditHeight(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer">
                      {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={handleEditTree} disabled={loading} className="btn-primary w-full disabled:opacity-50">
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </>
            )}
          </div>
        )}

        {/* REMOVE TREE */}
        {panel === 'remover' && (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-red-700">Remover Árvore</h2>
              <button onClick={() => setPanel('sessao')} className="text-sm text-gray-500 hover:underline cursor-pointer">Voltar</button>
            </div>

            {!removeTreeId ? (
              <div className="space-y-1 max-h-80 overflow-y-auto">
                <p className="text-sm text-gray-500 mb-2">Selecione a árvore para remover:</p>
                {trees.map(t => (
                  <button
                    key={t.id}
                    onClick={() => selectTreeForRemove(t)}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 text-sm cursor-pointer border-b border-gray-100"
                  >
                    <strong>{t.species.common_name}</strong> <span className="text-gray-400 text-xs">{t.qr_slug}</span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 font-medium">
                    Remover: {trees.find(t => t.id === removeTreeId)?.species.common_name} ({trees.find(t => t.id === removeTreeId)?.qr_slug})
                  </p>
                  <p className="text-xs text-red-500 mt-1">A árvore será marcada como removida no sistema.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da remoção</label>
                  <textarea value={removeReason} onChange={e => setRemoveReason(e.target.value)} rows={2}
                    placeholder="Ex: Árvore morta, risco de queda, identificação incorreta..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none" />
                </div>
                <button onClick={handleRemoveTree} disabled={loading}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50">
                  {loading ? 'Removendo...' : 'Confirmar Remoção'}
                </button>
              </>
            )}
          </div>
        )}

        {/* EDIT SPECIES */}
        {panel === 'editar_especie' && (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-purple-700">Editar Espécie</h2>
              <button onClick={() => setPanel('sessao')} className="text-sm text-gray-500 hover:underline cursor-pointer">Voltar</button>
            </div>

            {!editSpecId ? (
              <div className="space-y-1 max-h-80 overflow-y-auto">
                <p className="text-sm text-gray-500 mb-2">Selecione a espécie para editar:</p>
                {species.map(s => (
                  <button
                    key={s.id}
                    onClick={() => selectSpeciesForEdit(s)}
                    className="w-full text-left px-3 py-2 hover:bg-purple-50 text-sm cursor-pointer border-b border-gray-100"
                  >
                    <strong>{s.common_name}</strong> <span className="text-gray-400 italic text-xs">{s.scientific_name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome popular</label>
                    <input type="text" value={editSpecCommon} onChange={e => setEditSpecCommon(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome científico</label>
                    <input type="text" value={editSpecScientific} onChange={e => setEditSpecScientific(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Família</label>
                  <input type="text" value={editSpecFamily} onChange={e => setEditSpecFamily(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea value={editSpecDescription} onChange={e => setEditSpecDescription(e.target.value)} rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50 resize-none" />
                </div>
                <button onClick={handleEditSpecies} disabled={loading} className="btn-primary w-full disabled:opacity-50">
                  {loading ? 'Salvando...' : 'Salvar Espécie'}
                </button>
              </>
            )}
          </div>
        )}

        {/* ADD SUB-AREA */}
        {panel === 'adicionar_subarea' && (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-orange-700">Nova Sub-área</h2>
              <button onClick={() => setPanel('sessao')} className="text-sm text-gray-500 hover:underline cursor-pointer">Voltar</button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input type="text" value={saName} onChange={e => setSaName(e.target.value)}
                placeholder="Ex: Pomar Agroflorestal, Mata do Fundo..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea value={saDescription} onChange={e => setSaDescription(e.target.value)} rows={2}
                placeholder="Descrição da sub-área..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50 resize-none" />
            </div>
            <button onClick={handleAddSubArea} disabled={loading || !saName.trim()} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Salvando...' : 'Criar Sub-área'}
            </button>
          </div>
        )}

        {/* FINISH */}
        {panel === 'finalizar' && (
          <div className="card text-center space-y-4">
            <div className="text-4xl mb-2">✅</div>
            <h2 className="font-display text-xl font-bold text-verde-cerrado">Visita Finalizada!</h2>
            <p className="text-sm text-gray-500">
              {actions.length} ações registradas nesta visita.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-gray-700 mb-2">Resumo:</p>
              <div className="space-y-1 text-sm text-gray-600">
                {actions.filter(a => a.type === 'adicao_arvore').length > 0 && (
                  <p className="text-green-600">+ {actions.filter(a => a.type === 'adicao_arvore').length} árvores adicionadas</p>
                )}
                {actions.filter(a => a.type === 'remocao_arvore').length > 0 && (
                  <p className="text-red-600">- {actions.filter(a => a.type === 'remocao_arvore').length} árvores removidas</p>
                )}
                {actions.filter(a => a.type === 'edicao_arvore').length > 0 && (
                  <p className="text-blue-600">{actions.filter(a => a.type === 'edicao_arvore').length} árvores editadas</p>
                )}
                {actions.filter(a => a.type === 'edicao_especie').length > 0 && (
                  <p className="text-purple-600">{actions.filter(a => a.type === 'edicao_especie').length} espécies editadas</p>
                )}
                {actions.filter(a => a.type === 'adicao_subarea').length > 0 && (
                  <p className="text-orange-600">{actions.filter(a => a.type === 'adicao_subarea').length} sub-áreas criadas</p>
                )}
                {actions.length === 0 && <p>Nenhuma alteração registrada</p>}
              </div>
            </div>
            <div className="flex gap-3">
              <a href={`/${project.slug}/painel/visitas`} className="btn-secondary flex-1">
                Ver histórico
              </a>
              <a href={`/${project.slug}/painel`} className="btn-primary flex-1">
                Voltar ao painel
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
