'use client';

import { useState } from 'react';

interface ProjectRow {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string;
  state: string;
  status: string;
  planName: string;
  planId: string | null;
  gestorEmail: string | null;
  setupFee: number | null;
  setupInstallments: number | null;
  setupPayment: string | null;
  setupPaid: boolean;
  planExpiresAt: string | null;
  tagUnitPrice: number | null;
  tagMargin: number;
  tagCount: number;
  initialVisitCompleted: boolean;
  createdAt: string;
  treeCount: number;
  memberCount: number;
  visitCount: number;
  subAreaCount: number;
}

interface PlanRow {
  id: string;
  name: string;
  displayName: string;
  monthlyPrice: number;
  treeLimit: number | null;
  visitLimit: number | null;
  features: string[];
  active: boolean;
}

interface TechnicianRow {
  id: string;
  name: string;
  email: string;
  image: string | null;
  visitCount: number;
}

interface ReviewRow {
  id: string;
  projectName: string;
  projectSlug: string;
  entityType: string;
  entityId: string;
  reason: string;
  status: string;
  treeCount: number | null;
  reviewFee: number | null;
  billingPaid: boolean;
  createdAt: string;
}

interface VisitRow {
  id: string;
  projectName: string;
  projectSlug: string;
  technicianName: string;
  purpose: string;
  status: string;
  baseFee: number;
  travelCost: number | null;
  totalBilled: number | null;
  billingPaid: boolean;
  startedAt: string;
  finishedAt: string | null;
  actionCount: number;
}

interface ServiceRequestRow {
  id: string;
  projectName: string;
  projectSlug: string;
  gestorEmail: string;
  requestedBy: string;
  type: string;
  description: string;
  status: string;
  assignedTechnicianId: string | null;
  adminNote: string | null;
  createdAt: string;
}

interface Metrics {
  totalProjects: number;
  activeProjects: number;
  totalTrees: number;
  totalSpecies: number;
  totalObservations: number;
  totalTechnicians: number;
  openReviews: number;
  monthlyRevenue: number;
  totalSetupFees: number;
  setupPending: number;
  visitRevenue: number;
  visitsPending: number;
  reviewRevenue: number;
  reviewsPending: number;
  openServiceRequests: number;
}

interface Props {
  data: {
    projects: ProjectRow[];
    plans: PlanRow[];
    technicians: TechnicianRow[];
    reviewRequests: ReviewRow[];
    recentVisits: VisitRow[];
    serviceRequests: ServiceRequestRow[];
    metrics: Metrics;
  };
}

type Tab = 'overview' | 'projects' | 'plans' | 'technicians' | 'reviews' | 'visits' | 'requests' | 'tags';

const TYPE_LABELS: Record<string, string> = {
  condominio: 'Condomínio',
  parque: 'Parque',
  agrofloresta: 'Agrofloresta',
  incorporadora: 'Incorporadora',
};

const STATUS_COLORS: Record<string, string> = {
  ativo: 'bg-verde-medio/10 text-verde-medio',
  inativo: 'bg-gray-100 text-gray-500',
  trial: 'bg-blue-50 text-blue-600',
  suspenso: 'bg-terracota/10 text-terracota',
};

const REVIEW_STATUS_COLORS: Record<string, string> = {
  aberto: 'bg-ocre/10 text-ocre',
  em_analise: 'bg-blue-50 text-blue-600',
  resolvido: 'bg-verde-medio/10 text-verde-medio',
};

const REQUEST_TYPE_LABELS: Record<string, string> = {
  visita_tecnica: 'Visita Técnica',
  revisao_online: 'Revisão Online',
  nova_area: 'Nova Área',
  outro: 'Outro',
};

const REQUEST_STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-ocre/10 text-ocre',
  atribuido: 'bg-blue-50 text-blue-600',
  em_andamento: 'bg-blue-50 text-blue-600',
  concluido: 'bg-verde-medio/10 text-verde-medio',
  recusado: 'bg-gray-100 text-gray-500',
};

const BRL = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

export default function AdminDashboard({ data }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [techEmail, setTechEmail] = useState('');
  const [techLoading, setTechLoading] = useState(false);
  const [seedingSpecies, setSeedingSpecies] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  async function handleAssignPlan(projectId: string, planId: string) {
    setUpdatingPlan(projectId);
    try {
      await fetch('/api/admin/assign-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, planId: planId || null }),
      });
      window.location.reload();
    } catch {
      alert('Erro ao atualizar plano');
    }
    setUpdatingPlan(null);
  }

  async function handleUpdateProjectStatus(projectId: string, status: string) {
    try {
      await fetch('/api/admin/project-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, status }),
      });
      window.location.reload();
    } catch {
      alert('Erro ao atualizar status');
    }
  }

  async function handleEditProject(projectId: string, field: string, value: string) {
    try {
      await fetch('/api/admin/edit-project', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, [field]: value }),
      });
      window.location.reload();
    } catch {
      alert('Erro ao editar projeto');
    }
  }

  async function handleResolveReview(reviewId: string, response: string) {
    try {
      await fetch('/api/admin/resolve-review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, response }),
      });
      window.location.reload();
    } catch {
      alert('Erro ao resolver revisão');
    }
  }

  async function handleRegisterTechnician() {
    if (!techEmail.trim()) return;
    setTechLoading(true);
    try {
      const res = await fetch('/api/admin/register-technician', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: techEmail.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Erro ao cadastrar');
      } else {
        setTechEmail('');
        window.location.reload();
      }
    } catch {
      alert('Erro de conexão');
    }
    setTechLoading(false);
  }

  async function handleAssignTechnician(requestId: string, technicianId: string) {
    try {
      await fetch('/api/admin/service-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, assignedTechnicianId: technicianId, status: 'atribuido' }),
      });
      window.location.reload();
    } catch {
      alert('Erro ao atribuir técnico');
    }
  }

  const m = data.metrics;
  const unpaidVisits = data.recentVisits.filter(v => v.totalBilled && !v.billingPaid).length;

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'projects', label: 'Projetos' },
    { id: 'plans', label: 'Planos' },
    { id: 'technicians', label: 'Técnicos' },
    { id: 'reviews', label: 'Revisões', badge: m.openReviews },
    { id: 'visits', label: 'Visitas', badge: unpaidVisits || undefined },
    { id: 'requests', label: 'Solicitações', badge: m.openServiceRequests || undefined },
    { id: 'tags', label: 'Plaquinhas' },
  ];

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap relative ${
              tab === t.id
                ? 'bg-verde-cerrado text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.label}
            {t.badge && t.badge > 0 && (
              <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 font-bold ${
                tab === t.id ? 'bg-white/20' : 'bg-red-500 text-white'
              }`}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Projetos ativos" value={m.activeProjects} onClick={() => setTab('projects')} />
            <MetricCard label="Total de árvores" value={m.totalTrees} />
            <MetricCard label="Espécies" value={m.totalSpecies} />
            <MetricCard label="Observações" value={m.totalObservations} />
            <MetricCard label="Técnicos" value={m.totalTechnicians} onClick={() => setTab('technicians')} />
            <MetricCard label="Revisões abertas" value={m.openReviews} highlight={m.openReviews > 0} onClick={() => setTab('reviews')} />
            <MetricCard label="Solicitações" value={m.openServiceRequests} highlight={m.openServiceRequests > 0} onClick={() => setTab('requests')} />
            <MetricCard label="Receita mensal" value={`R$ ${BRL(m.monthlyRevenue)}`} />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-verde-cerrado text-sm">Banco de Espécies</h3>
              <p className="text-xs text-gray-500">Carregar 250 espécies (frutíferas, nativas, ornamentais)</p>
            </div>
            <button
              onClick={async () => {
                setSeedingSpecies(true);
                setSeedResult(null);
                try {
                  const res = await fetch('/api/admin/seed-species', { method: 'POST' });
                  const data = await res.json();
                  setSeedResult(data.message);
                  if (data.inserted > 0) setTimeout(() => window.location.reload(), 2000);
                } catch {
                  setSeedResult('Erro ao carregar espécies');
                }
                setSeedingSpecies(false);
              }}
              disabled={seedingSpecies}
              className="bg-verde-cerrado text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-verde-cerrado/90 disabled:opacity-50 cursor-pointer"
            >
              {seedingSpecies ? 'Carregando...' : 'Carregar Espécies'}
            </button>
            {seedResult && <span className="text-xs text-verde-medio ml-2">{seedResult}</span>}
          </div>

          {m.openServiceRequests > 0 && (
            <div className="bg-white rounded-xl border border-red-200 p-4">
              <h3 className="font-bold text-red-600 mb-3">Solicitações pendentes</h3>
              <div className="space-y-2">
                {data.serviceRequests.filter(s => s.status === 'pendente').slice(0, 5).map(s => (
                  <div key={s.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
                    <div>
                      <span className="font-medium text-gray-700">{s.projectName}</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-gray-500">{REQUEST_TYPE_LABELS[s.type] || s.type}</span>
                    </div>
                    <button onClick={() => setTab('requests')} className="text-verde-medio text-xs font-medium hover:underline cursor-pointer">Ver</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {m.openReviews > 0 && (
            <div className="bg-white rounded-xl border border-ocre/30 p-4">
              <h3 className="font-bold text-ocre mb-3">Revisões pendentes</h3>
              <div className="space-y-2">
                {data.reviewRequests.slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
                    <div>
                      <span className="font-medium text-gray-700">{r.projectName}</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-gray-500">{r.entityType === 'observation' ? 'Observação' : 'Espécie'}</span>
                    </div>
                    <button onClick={() => setTab('reviews')} className="text-verde-medio text-xs font-medium hover:underline cursor-pointer">Ver</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-bold text-verde-cerrado mb-3">Últimas visitas técnicas</h3>
            <div className="space-y-2">
              {data.recentVisits.slice(0, 5).map(v => (
                <div key={v.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
                  <div>
                    <span className="font-medium text-gray-700">{v.projectName}</span>
                    <span className="text-gray-400 mx-2">·</span>
                    <span className="text-gray-500">{v.technicianName}</span>
                    <span className="text-gray-400 mx-2">·</span>
                    <span className="text-gray-400 text-xs">{new Date(v.startedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${v.status === 'finalizada' ? 'bg-verde-medio/10 text-verde-medio' : 'bg-ocre/10 text-ocre'}`}>
                    {v.status === 'finalizada' ? 'Finalizada' : 'Em andamento'}
                  </span>
                </div>
              ))}
              {data.recentVisits.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Nenhuma visita registrada.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Projects */}
      {tab === 'projects' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-verde-cerrado">Projetos ({data.projects.length})</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {data.projects.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                plans={data.plans}
                isEditing={editingProject === p.id}
                updatingPlan={updatingPlan}
                onToggleEdit={() => setEditingProject(editingProject === p.id ? null : p.id)}
                onAssignPlan={handleAssignPlan}
                onUpdateStatus={handleUpdateProjectStatus}
                onEditField={handleEditProject}
              />
            ))}
          </div>
        </div>
      )}

      {/* Plans */}
      {tab === 'plans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.plans.map(plan => {
              const projectCount = data.projects.filter(p => p.planId === plan.id).length;
              return (
                <div key={plan.id} className="bg-white rounded-xl shadow-sm p-6 space-y-4 border-2 border-gray-100 hover:border-verde-medio/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold text-verde-cerrado">{plan.displayName}</h3>
                    {!plan.active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inativo</span>}
                  </div>
                  <p className="text-3xl font-bold text-verde-cerrado">
                    R$ {BRL(plan.monthlyPrice)}
                    <span className="text-sm font-normal text-gray-400">/mês</span>
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Árvores: {plan.treeLimit ? plan.treeLimit.toLocaleString('pt-BR') : 'Ilimitadas'}</p>
                    <p>Visitas/ano: {plan.visitLimit === 0 ? 'Não inclusa' : plan.visitLimit ?? 'Ilimitadas'}</p>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-verde-medio mt-0.5">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      <span className="font-bold text-verde-cerrado text-lg">{projectCount}</span> projetos neste plano
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-verde-cerrado mb-4">Tabela de serviços avulsos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Visita técnica presencial</h4>
                <div className="text-sm text-gray-600 space-y-1 bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-verde-cerrado text-lg">R$ 1.800,00</p>
                  <p className="text-gray-400">+ custos de deslocamento, hospedagem e alimentação</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Revisão técnica online</h4>
                <div className="text-sm space-y-1 bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between"><span className="text-gray-600">1 a 10 árvores</span><span className="font-medium text-verde-cerrado">R$ 150,00</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">11 a 30 árvores</span><span className="font-medium text-verde-cerrado">R$ 250,00</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">31 a 50 árvores</span><span className="font-medium text-verde-cerrado">R$ 350,00</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technicians */}
      {tab === 'technicians' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-verde-cerrado mb-4">Cadastrar técnico</h3>
            <div className="flex gap-3">
              <input
                type="email"
                value={techEmail}
                onChange={e => setTechEmail(e.target.value)}
                placeholder="Email do técnico (Google)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-verde-medio/50 focus:border-verde-medio outline-none"
                onKeyDown={e => e.key === 'Enter' && handleRegisterTechnician()}
              />
              <button
                onClick={handleRegisterTechnician}
                disabled={techLoading || !techEmail.trim()}
                className="bg-verde-cerrado text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-verde-medio transition-colors disabled:opacity-50 cursor-pointer"
              >
                {techLoading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">O técnico precisa fazer login com este email Google para acessar o sistema.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-verde-cerrado mb-4">Técnicos cadastrados ({data.technicians.length})</h3>
            {data.technicians.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhum técnico cadastrado.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.technicians.map(tech => (
                  <div key={tech.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                    {tech.image ? (
                      <img src={tech.image} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-verde-medio/10 flex items-center justify-center text-verde-medio font-bold">
                        {tech.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-700 truncate">{tech.name}</p>
                      <p className="text-xs text-gray-400 truncate">{tech.email}</p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p className="font-medium">{tech.visitCount}</p>
                      <p>visitas</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews */}
      {tab === 'reviews' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-verde-cerrado mb-4">Revisões técnicas ({data.reviewRequests.length})</h3>
          {data.reviewRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-gray-400">Nenhuma revisão pendente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.reviewRequests.map(r => (
                <ReviewCard key={r.id} review={r} onResolve={handleResolveReview} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Visits */}
      {tab === 'visits' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-verde-cerrado">Histórico de visitas ({data.recentVisits.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Projeto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Técnico</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Objetivo</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Ações</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Valor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Data</th>
                </tr>
              </thead>
              <tbody>
                {data.recentVisits.map(v => (
                  <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <a href={`/${v.projectSlug}/painel/visitas`} target="_blank" rel="noopener noreferrer" className="text-verde-cerrado font-medium hover:underline">
                        {v.projectName}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{v.technicianName}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">{v.purpose}</td>
                    <td className="py-3 px-4 text-center font-medium">{v.actionCount}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${v.status === 'finalizada' ? 'bg-verde-medio/10 text-verde-medio' : 'bg-ocre/10 text-ocre'}`}>
                        {v.status === 'finalizada' ? 'Finalizada' : 'Em andamento'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {v.totalBilled ? (
                        <div className="text-xs">
                          <span className={`font-medium ${v.billingPaid ? 'text-verde-medio' : 'text-ocre'}`}>
                            R$ {BRL(v.totalBilled)}
                          </span>
                          <br />
                          <span className="text-gray-400">{v.billingPaid ? '✓ Pago' : 'Pendente'}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">R$ {v.baseFee.toLocaleString('pt-BR')} + desloc.</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(v.startedAt).toLocaleDateString('pt-BR')}
                      {v.finishedAt && ` — ${new Date(v.finishedAt).toLocaleDateString('pt-BR')}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Service Requests */}
      {tab === 'requests' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-verde-cerrado mb-4">Solicitações técnicas ({data.serviceRequests.length})</h3>
          {data.serviceRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-400">Nenhuma solicitação recebida.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.serviceRequests.map(s => (
                <ServiceRequestCard
                  key={s.id}
                  request={s}
                  technicians={data.technicians}
                  onAssign={handleAssignTechnician}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tags / Plaquinhas */}
      {tab === 'tags' && (() => {
        const projectsWithTags = data.projects.filter(p => p.tagCount > 0);
        const totalTags = data.projects.reduce((s, p) => s + p.tagCount, 0);
        const totalTagRevenue = data.projects.reduce((s, p) => {
          const price = p.tagUnitPrice || 3.90;
          return s + (p.tagCount * price * (1 + p.tagMargin));
        }, 0);
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-verde-cerrado">{totalTags}</p>
                <p className="text-xs text-gray-500 mt-1">Plaquinhas instaladas</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-verde-cerrado">R$ {BRL(totalTagRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">Faturamento total</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-verde-cerrado">{projectsWithTags.length}</p>
                <p className="text-xs text-gray-500 mt-1">Projetos com plaquinhas</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-verde-cerrado">Faturamento por projeto</h3>
                <p className="text-xs text-gray-400 mt-1">Preço unitário: R$ 3,90 · Margem: 30%</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Projeto</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Árvores</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Plaquinhas</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.projects.map(p => {
                    const price = p.tagUnitPrice || 3.90;
                    const revenue = p.tagCount * price * (1 + p.tagMargin);
                    return (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-700">{p.name}</td>
                        <td className="py-3 px-4 text-center text-gray-500">{p.treeCount}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-medium ${p.tagCount > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {p.tagCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-verde-cerrado">
                          {p.tagCount > 0 ? `R$ ${BRL(revenue)}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function MetricCard({ label, value, highlight, onClick }: { label: string; value: string | number; highlight?: boolean; onClick?: () => void }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-4 text-center ${highlight ? 'ring-2 ring-red-300' : ''} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <p className="text-2xl font-bold text-verde-cerrado">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function PlanExpirationBar({ expiresAt }: { expiresAt: string | null }) {
  if (!expiresAt) return <span className="text-xs text-gray-300">Sem expiração</span>;
  const now = Date.now();
  const expires = new Date(expiresAt).getTime();
  const totalDays = 365;
  const daysLeft = Math.max(0, Math.ceil((expires - now) / (1000 * 60 * 60 * 24)));
  const pct = Math.min(100, Math.max(0, (daysLeft / totalDays) * 100));
  const isUrgent = daysLeft <= 60;

  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className={isUrgent ? 'text-red-600 font-bold' : 'text-gray-500'}>{daysLeft} dias restantes</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isUrgent ? 'bg-red-500' : 'bg-verde-medio'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ProjectCard({ project: p, plans, isEditing, updatingPlan, onToggleEdit, onAssignPlan, onUpdateStatus, onEditField }: {
  project: ProjectRow;
  plans: PlanRow[];
  isEditing: boolean;
  updatingPlan: string | null;
  onToggleEdit: () => void;
  onAssignPlan: (id: string, planId: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onEditField: (id: string, field: string, value: string) => void;
}) {
  const [editName, setEditName] = useState(p.name);
  const [editGestor, setEditGestor] = useState(p.gestorEmail || '');

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a href={`/${p.slug}/painel`} target="_blank" rel="noopener noreferrer" className="font-bold text-verde-cerrado hover:underline truncate">
              {p.name}
            </a>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span>
          </div>
          <p className="text-xs text-gray-400">{TYPE_LABELS[p.type] || p.type} · {p.city}/{p.state} · {new Date(p.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-verde-medio/10 text-verde-medio px-2 py-0.5 rounded-full">{p.treeCount} árv.</span>
          {p.tagCount > 0 && <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">🏷️ {p.tagCount}</span>}
          <span className="text-gray-400">{p.memberCount} membros</span>
          <button onClick={onToggleEdit} className="text-ocre hover:underline cursor-pointer">{isEditing ? 'Fechar' : 'Editar'}</button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Plano:</span>
          <select
            value={p.planId || ''}
            onChange={e => onAssignPlan(p.id, e.target.value)}
            disabled={updatingPlan === p.id}
            className="border border-gray-200 rounded px-2 py-1 bg-white cursor-pointer disabled:opacity-50 text-xs"
          >
            <option value="">Sem plano</option>
            {plans.map(plan => (<option key={plan.id} value={plan.id}>{plan.displayName}</option>))}
          </select>
        </div>
        <div className="flex-1 max-w-[200px]">
          <PlanExpirationBar expiresAt={p.planExpiresAt} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Status:</span>
          <select
            value={p.status}
            onChange={e => onUpdateStatus(p.id, e.target.value)}
            className={`px-2 py-1 rounded-full font-medium border-0 cursor-pointer text-xs ${STATUS_COLORS[p.status] || ''}`}
          >
            <option value="ativo">Ativo</option>
            <option value="trial">Trial</option>
            <option value="suspenso">Suspenso</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
      </div>

      {p.setupFee && (
        <div className="text-xs text-gray-500">
          Setup: <span className={p.setupPaid ? 'text-verde-medio' : 'text-ocre'}>R$ {p.setupFee.toLocaleString('pt-BR')}</span>
          {p.setupPaid ? ' ✓ Pago' : ` · ${p.setupPayment === 'parcelado' ? `${p.setupInstallments}x pendente` : 'À vista pendente'}`}
        </div>
      )}

      {isEditing && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Nome do projeto</label>
              <div className="flex gap-2">
                <input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm" />
                <button onClick={() => onEditField(p.id, 'name', editName)} className="bg-verde-cerrado text-white px-3 py-1 rounded text-xs cursor-pointer">Salvar</button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Email do gestor</label>
              <div className="flex gap-2">
                <input value={editGestor} onChange={e => setEditGestor(e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm" />
                <button onClick={() => onEditField(p.id, 'gestorEmail', editGestor)} className="bg-verde-cerrado text-white px-3 py-1 rounded text-xs cursor-pointer">Salvar</button>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <a href={`/${p.slug}/painel`} target="_blank" rel="noopener noreferrer" className="text-verde-medio text-xs hover:underline">Painel ↗</a>
            <a href={`/${p.slug}/painel/qrcodes`} target="_blank" rel="noopener noreferrer" className="text-ocre text-xs hover:underline">QR Codes ↗</a>
            <a href={`/${p.slug}/dashboard`} target="_blank" rel="noopener noreferrer" className="text-gray-500 text-xs hover:underline">Dashboard ↗</a>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review, onResolve }: { review: ReviewRow; onResolve: (id: string, response: string) => void }) {
  const [responding, setResponding] = useState(false);
  const [response, setResponse] = useState('');

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-gray-700">
            <a href={`/${review.projectSlug}/painel`} target="_blank" rel="noopener noreferrer" className="text-verde-cerrado hover:underline">{review.projectName}</a>
            <span className="text-gray-400 mx-2">·</span>
            <span className="text-gray-500">{review.entityType === 'observation' ? 'Observação' : 'Espécie'}</span>
          </p>
          <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${REVIEW_STATUS_COLORS[review.status] || ''}`}>
          {review.status === 'aberto' ? 'Aberto' : review.status === 'em_analise' ? 'Em análise' : 'Resolvido'}
        </span>
      </div>
      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{review.reason}</p>
      {review.reviewFee && (
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500">{review.treeCount} árvore(s)</span>
          <span className={`font-medium ${review.billingPaid ? 'text-verde-medio' : 'text-ocre'}`}>
            R$ {BRL(review.reviewFee)} {review.billingPaid ? '✓ Pago' : 'Pendente'}
          </span>
        </div>
      )}
      {!responding ? (
        <button onClick={() => setResponding(true)} className="text-verde-medio text-sm font-medium hover:underline cursor-pointer">Responder</button>
      ) : (
        <div className="space-y-2">
          <textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
            placeholder="Parecer técnico..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none h-20 focus:ring-2 focus:ring-verde-medio/50 focus:border-verde-medio outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { onResolve(review.id, response); setResponding(false); }}
              className="bg-verde-medio text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-verde-cerrado transition-colors cursor-pointer"
            >Resolver</button>
            <button onClick={() => { setResponding(false); setResponse(''); }} className="text-gray-400 text-sm hover:underline cursor-pointer">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceRequestCard({ request: s, technicians, onAssign }: {
  request: ServiceRequestRow;
  technicians: TechnicianRow[];
  onAssign: (requestId: string, technicianId: string) => void;
}) {
  const [selectedTech, setSelectedTech] = useState(s.assignedTechnicianId || '');

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-gray-700">
            <a href={`/${s.projectSlug}/dashboard`} target="_blank" rel="noopener noreferrer" className="text-verde-cerrado hover:underline">{s.projectName}</a>
            <span className="text-gray-400 mx-2">·</span>
            <span className="text-gray-500">{s.gestorEmail}</span>
          </p>
          <p className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{REQUEST_TYPE_LABELS[s.type] || s.type}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${REQUEST_STATUS_COLORS[s.status] || ''}`}>{s.status}</span>
        </div>
      </div>
      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{s.description}</p>
      {s.status === 'pendente' && (
        <div className="flex items-center gap-3">
          <select
            value={selectedTech}
            onChange={e => setSelectedTech(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 max-w-xs"
          >
            <option value="">Selecionar técnico...</option>
            {technicians.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
          </select>
          <button
            onClick={() => selectedTech && onAssign(s.id, selectedTech)}
            disabled={!selectedTech}
            className="bg-verde-cerrado text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-verde-medio transition-colors disabled:opacity-50 cursor-pointer"
          >Atribuir</button>
        </div>
      )}
      {s.assignedTechnicianId && (
        <p className="text-xs text-gray-500">
          Técnico: <span className="font-medium">{technicians.find(t => t.id === s.assignedTechnicianId)?.name || s.assignedTechnicianId}</span>
        </p>
      )}
      {s.adminNote && <p className="text-xs text-gray-500 italic">Nota: {s.adminNote}</p>}
    </div>
  );
}
