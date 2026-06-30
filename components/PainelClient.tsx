'use client';

import { useState } from 'react';
import type { PainelData } from '@/app/[projectSlug]/painel/page';

type Tab = 'arvores' | 'submissoes' | 'moradores';

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

const SERVICES = [
  { id: 'reflorestamento', icon: '🌱', label: 'Projeto de Reflorestamento', description: 'Planejamento e execução de áreas degradadas' },
  { id: 'pomar', icon: '🍊', label: 'Pomar e Horta Comunitária', description: 'Implantação de pomares e hortas produtivas' },
  { id: 'paisagismo', icon: '🌺', label: 'Paisagismo Funcional', description: 'Paisagismo com espécies nativas e frutíferas' },
  { id: 'adubacao', icon: '🧪', label: 'Recomendações de Adubação', description: 'Análise de solo e plano de adubação' },
  { id: 'assessoria', icon: '💻', label: 'Assessoria Técnica Remota', description: 'Consultoria online para plantio e manejo' },
  { id: 'curso', icon: '📚', label: 'Curso Presencial de Agrofloresta', description: 'Capacitação prática em sistemas agroflorestais' },
];

interface Resident {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
}

export default function PainelClient({ data }: { data: PainelData }) {
  const [tab, setTab] = useState<Tab>('arvores');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [reliabilityFilter, setReliabilityFilter] = useState<string>('');
  const [residents, setResidents] = useState<Resident[]>([]);
  const [residentsLoaded, setResidentsLoaded] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [addingResident, setAddingResident] = useState(false);

  async function loadResidents() {
    if (residentsLoaded) return;
    const res = await fetch(`/api/projects/${data.projectSlug}/residents`);
    if (res.ok) setResidents(await res.json());
    setResidentsLoaded(true);
  }

  async function addResident() {
    if (!newName.trim() || !newEmail.trim()) return;
    setAddingResident(true);
    const res = await fetch(`/api/projects/${data.projectSlug}/residents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, email: newEmail, phone: newPhone }),
    });
    if (res.ok) {
      const r = await res.json();
      setResidents(prev => [r, ...prev]);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
    } else {
      const err = await res.json();
      alert(err.error || 'Erro ao cadastrar');
    }
    setAddingResident(false);
  }

  async function removeResident(id: string) {
    if (!confirm('Remover este morador?')) return;
    const res = await fetch(`/api/projects/${data.projectSlug}/residents?id=${id}`, { method: 'DELETE' });
    if (res.ok) setResidents(prev => prev.filter(r => r.id !== id));
  }

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
      {/* Initial visit banner */}
      {data.userRole === 'gestor' && data.initialVisitCompleted === false && (
        <div className="bg-ocre/10 border border-ocre/30 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">🚧</span>
          <div>
            <h3 className="font-bold text-ocre">Aguardando visita técnica inicial</h3>
            <p className="text-sm text-gray-600 mt-1">
              Um técnico da AgroSintropia precisa realizar a visita técnica inicial para identificar e catalogar as árvores do projeto.
              Enquanto isso, o cadastro de árvores está disponível apenas para técnicos.
            </p>
          </div>
        </div>
      )}

      {/* Empty project CTA */}
      {data.totalTrees === 0 && data.userRole === 'tecnico' && (
        <div className="card border-2 border-dashed border-verde-medio text-center py-8">
          <div className="text-4xl mb-3">🌱</div>
          <h2 className="font-display text-xl font-bold text-verde-cerrado mb-2">
            Seu projeto está vazio
          </h2>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            Inicie uma visita técnica para cadastrar as primeiras árvores do projeto.
            Todas as adições serão registradas automaticamente.
          </p>
          <a
            href={`/${data.projectSlug}/visita`}
            className="btn-primary inline-block text-base"
          >
            Iniciar visita técnica
          </a>
        </div>
      )}

      {/* Invite link for gestor */}
      {data.userRole === 'gestor' && data.inviteCode && (
        <div className="card border-l-4 border-l-verde-medio">
          <p className="text-sm font-medium text-verde-cerrado mb-1">Link de convite para moradores</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded-lg break-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/convite/${data.inviteCode}` : `/convite/${data.inviteCode}`}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/convite/${data.inviteCode}`);
                alert('Link copiado!');
              }}
              className="bg-verde-medio text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-verde-cerrado transition-colors cursor-pointer whitespace-nowrap"
            >
              Copiar
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Envie este link aos moradores. Apenas emails cadastrados na aba "Moradores" terão acesso.</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {data.userRole === 'tecnico' && (
          <a href="/projetos/novo" className="bg-verde-cerrado text-white px-6 py-3 rounded-lg font-semibold hover:bg-verde-cerrado/90 transition-colors text-sm border-2 border-verde-medio">
            + Criar novo projeto
          </a>
        )}
        {data.userRole === 'tecnico' && (
          <a href={`/${data.projectSlug}/painel/arvores/nova`} className="btn-primary text-sm">
            + Cadastrar nova árvore
          </a>
        )}
        {data.userRole === 'gestor' && data.initialVisitCompleted !== false && (
          <a href={`/${data.projectSlug}/painel/arvores/nova`} className="btn-primary text-sm">
            + Cadastrar nova árvore
          </a>
        )}
        <a href={`/api/projects/${data.projectSlug}/export`} className="btn-secondary text-sm">
          Exportar CSV
        </a>
        <a href={`/${data.projectSlug}/relatorio`} className="bg-white text-verde-cerrado border border-verde-medio px-6 py-3 rounded-lg font-semibold hover:bg-verde-medio/5 transition-colors text-sm">
          Relatório de diversidade
        </a>
        <a href={`/${data.projectSlug}/painel/observacoes`} className="bg-white text-terracota border border-terracota px-6 py-3 rounded-lg font-semibold hover:bg-terracota/5 transition-colors text-sm relative">
          Observações dos moradores
          {(data.pendingObservations ?? 0) > 0 && (
            <span className="absolute -top-2 -right-2 bg-terracota text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {data.pendingObservations}
            </span>
          )}
        </a>
        {data.userRole === 'tecnico' && (
          <>
            <a href={`/${data.projectSlug}/visita`} className="bg-verde-medio text-white px-6 py-3 rounded-lg font-semibold hover:bg-verde-medio/90 transition-colors text-sm">
              Iniciar visita técnica
            </a>
            <a href={`/${data.projectSlug}/painel/visitas`} className="bg-white text-verde-cerrado border border-verde-cerrado px-6 py-3 rounded-lg font-semibold hover:bg-verde-cerrado/5 transition-colors text-sm">
              Histórico de visitas
            </a>
          </>
        )}
        {data.userRole === 'gestor' && (
          <a href={`/${data.projectSlug}/painel/visitas`} className="bg-white text-verde-cerrado border border-verde-cerrado px-6 py-3 rounded-lg font-semibold hover:bg-verde-cerrado/5 transition-colors text-sm">
            Histórico de visitas
          </a>
        )}
      </div>

      {/* Services CTA for gestor */}
      {data.userRole === 'gestor' && (
        <div className="card space-y-3">
          <h3 className="font-display text-lg font-bold text-verde-cerrado">Serviços AgroSintropia</h3>
          <p className="text-sm text-gray-500">Conheça nossos serviços especializados. Clique para falar com nosso comercial.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SERVICES.map(s => (
              <a
                key={s.id}
                href={`https://wa.me/5562998062150?text=${encodeURIComponent(`Olá AgroSintropia! Tenho interesse no serviço: *${s.label}*\n\nProjeto: ${data.projectName}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-verde-medio hover:bg-verde-claro/10 transition-all group"
              >
                <span className="text-xl">{s.icon}</span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-700 text-sm group-hover:text-verde-cerrado">{s.label}</p>
                  <p className="text-xs text-gray-400">{s.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

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
        {data.userRole === 'gestor' && (
          <button
            onClick={() => { setTab('moradores'); loadResidents(); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              tab === 'moradores'
                ? 'bg-verde-cerrado text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Moradores
          </button>
        )}
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

      {/* Moradores tab */}
      {tab === 'moradores' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-display text-lg font-bold text-verde-cerrado mb-4">Cadastrar morador</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nome *"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
              />
              <input
                type="email"
                placeholder="Email *"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-verde-medio/50"
              />
            </div>
            <button
              onClick={addResident}
              disabled={addingResident || !newName.trim() || !newEmail.trim()}
              className="btn-primary text-sm mt-3 disabled:opacity-50 cursor-pointer"
            >
              {addingResident ? 'Cadastrando...' : '+ Cadastrar morador'}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Apenas moradores cadastrados aqui poderão acessar o projeto pelo link de convite.
            </p>
          </div>

          <div className="card">
            <h3 className="font-display text-lg font-bold text-verde-cerrado mb-4">
              Moradores cadastrados ({residents.length})
            </h3>
            {residents.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Nenhum morador cadastrado ainda.</p>
            ) : (
              <div className="space-y-2">
                {residents.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-700 truncate">{r.name}</p>
                      <p className="text-xs text-gray-400 truncate">{r.email}{r.phone ? ` · ${r.phone}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {r.status === 'ativo' ? 'Ativo' : 'Pendente'}
                      </span>
                      <button
                        onClick={() => removeResident(r.id)}
                        className="text-gray-400 hover:text-red-500 text-sm cursor-pointer"
                        title="Remover"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
