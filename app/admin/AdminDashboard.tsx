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
}

interface Props {
  data: {
    projects: ProjectRow[];
    plans: PlanRow[];
    technicians: TechnicianRow[];
    reviewRequests: ReviewRow[];
    recentVisits: VisitRow[];
    metrics: Metrics;
  };
}

type Tab = 'overview' | 'projects' | 'plans' | 'technicians' | 'reviews' | 'visits';

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

export default function AdminDashboard({ data }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

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

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'projects', label: 'Projetos' },
    { id: 'plans', label: 'Planos' },
    { id: 'technicians', label: 'Técnicos' },
    { id: 'reviews', label: 'Revisões', badge: data.metrics.openReviews },
    { id: 'visits', label: 'Visitas' },
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
              <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${
                tab === t.id ? 'bg-white/20' : 'bg-terracota text-white'
              }`}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Projetos ativos" value={data.metrics.activeProjects} icon="🏢" />
            <MetricCard label="Total de árvores" value={data.metrics.totalTrees} icon="🌳" />
            <MetricCard label="Espécies cadastradas" value={data.metrics.totalSpecies} icon="🌿" />
            <MetricCard label="Observações" value={data.metrics.totalObservations} icon="📝" />
            <MetricCard label="Técnicos" value={data.metrics.totalTechnicians} icon="🔬" />
            <MetricCard label="Revisões abertas" value={data.metrics.openReviews} icon="📋" highlight={data.metrics.openReviews > 0} />
            <MetricCard label="Receita mensal" value={`R$ ${data.metrics.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon="💰" />
            <MetricCard label="Visitas técnicas" value={`R$ ${data.metrics.visitRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon="🚗" highlight={data.metrics.visitsPending > 0} />
            <MetricCard label="Revisões online" value={`R$ ${data.metrics.reviewRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon="🔍" highlight={data.metrics.reviewsPending > 0} />
            <MetricCard label="Setup fees" value={`R$ ${data.metrics.totalSetupFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon="🏷️" highlight={data.metrics.setupPending > 0} />
          </div>

          {/* Quick actions */}
          {data.metrics.openReviews > 0 && (
            <div className="bg-white rounded-xl border border-ocre/30 p-4">
              <h3 className="font-bold text-ocre mb-3">Revisões técnicas pendentes</h3>
              <div className="space-y-2">
                {data.reviewRequests.slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
                    <div>
                      <span className="font-medium text-gray-700">{r.projectName}</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-gray-500">{r.entityType === 'observation' ? 'Observação' : 'Espécie'}</span>
                    </div>
                    <button
                      onClick={() => setTab('reviews')}
                      className="text-verde-medio text-xs font-medium hover:underline cursor-pointer"
                    >
                      Ver
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent visits */}
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{v.actionCount} ações</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      v.status === 'finalizada' ? 'bg-verde-medio/10 text-verde-medio' : 'bg-ocre/10 text-ocre'
                    }`}>
                      {v.status === 'finalizada' ? 'Finalizada' : 'Em andamento'}
                    </span>
                  </div>
                </div>
              ))}
              {data.recentVisits.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">Nenhuma visita registrada.</p>
              )}
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Projeto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Local</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Plano</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Árvores</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Membros</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Visitas</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Gestor</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Setup</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.projects.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <a href={`/${p.slug}/painel`} className="font-medium text-verde-cerrado hover:underline">
                        {p.name}
                      </a>
                      <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{TYPE_LABELS[p.type] || p.type}</td>
                    <td className="py-3 px-4 text-gray-600">{p.city}/{p.state}</td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={p.status}
                        onChange={e => handleUpdateProjectStatus(p.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${STATUS_COLORS[p.status] || ''}`}
                      >
                        <option value="ativo">Ativo</option>
                        <option value="trial">Trial</option>
                        <option value="suspenso">Suspenso</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={p.planId || ''}
                        onChange={e => handleAssignPlan(p.id, e.target.value)}
                        disabled={updatingPlan === p.id}
                        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white cursor-pointer disabled:opacity-50"
                      >
                        <option value="">Sem plano</option>
                        {data.plans.map(plan => (
                          <option key={plan.id} value={plan.id}>{plan.displayName}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">{p.treeCount}</td>
                    <td className="py-3 px-4 text-center">{p.memberCount}</td>
                    <td className="py-3 px-4 text-center">{p.visitCount}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{p.gestorEmail || '—'}</td>
                    <td className="py-3 px-4 text-center">
                      {p.setupFee ? (
                        <div className="text-xs">
                          <span className={`font-medium ${p.setupPaid ? 'text-verde-medio' : 'text-ocre'}`}>
                            R$ {p.setupFee.toLocaleString('pt-BR')}
                          </span>
                          <br />
                          <span className="text-gray-400">
                            {p.setupPaid ? '✓ Pago' : p.setupPayment === 'parcelado' ? `${p.setupInstallments}x pendente` : 'À vista pendente'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center space-x-2">
                      <a href={`/${p.slug}/painel`} className="text-verde-medio text-xs hover:underline">
                        Painel
                      </a>
                      <a href={`/${p.slug}/painel/qrcodes`} className="text-ocre text-xs hover:underline">
                        QR Codes
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                    R$ {plan.monthlyPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

          {/* Revenue summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-verde-cerrado mb-4">Resumo financeiro</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.plans.map(plan => {
                const count = data.projects.filter(p => p.planId === plan.id && p.status === 'ativo').length;
                return (
                  <div key={plan.id} className="text-center">
                    <p className="text-sm text-gray-500">{plan.displayName}</p>
                    <p className="text-lg font-bold text-verde-cerrado">{count} ativos</p>
                    <p className="text-sm text-gray-400">
                      R$ {(count * plan.monthlyPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                    </p>
                  </div>
                );
              })}
              <div className="text-center border-l-2 border-verde-medio pl-4">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold text-verde-cerrado">
                  R$ {data.metrics.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-400">/mês</p>
              </div>
            </div>
          </div>

          {/* Service pricing reference */}
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
                  <div className="min-w-0">
                    <p className="font-medium text-gray-700 truncate">{tech.name}</p>
                    <p className="text-xs text-gray-400 truncate">{tech.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews */}
      {tab === 'reviews' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-verde-cerrado mb-4">Revisões técnicas online ({data.reviewRequests.length})</h3>
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
                      <a href={`/${v.projectSlug}/painel/visitas`} className="text-verde-cerrado font-medium hover:underline">
                        {v.projectName}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{v.technicianName}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">{v.purpose}</td>
                    <td className="py-3 px-4 text-center font-medium">{v.actionCount}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        v.status === 'finalizada' ? 'bg-verde-medio/10 text-verde-medio' : 'bg-ocre/10 text-ocre'
                      }`}>
                        {v.status === 'finalizada' ? 'Finalizada' : 'Em andamento'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {v.totalBilled ? (
                        <div className="text-xs">
                          <span className={`font-medium ${v.billingPaid ? 'text-verde-medio' : 'text-ocre'}`}>
                            R$ {v.totalBilled.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <br />
                          <span className="text-gray-400">
                            {v.billingPaid ? '✓ Pago' : 'Pendente'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          R$ {v.baseFee.toLocaleString('pt-BR')} + desloc.
                        </span>
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
    </div>
  );
}

function MetricCard({ label, value, icon, highlight }: { label: string; value: string | number; icon: string; highlight?: boolean }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 text-center ${highlight ? 'ring-2 ring-terracota/30' : ''}`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-2xl font-bold text-verde-cerrado">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
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
            <a href={`/${review.projectSlug}/painel`} className="text-verde-cerrado hover:underline">
              {review.projectName}
            </a>
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
            R$ {review.reviewFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            {review.billingPaid ? ' ✓ Pago' : ' Pendente'}
          </span>
        </div>
      )}
      {!responding ? (
        <button
          onClick={() => setResponding(true)}
          className="text-verde-medio text-sm font-medium hover:underline cursor-pointer"
        >
          Responder
        </button>
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
            >
              Resolver
            </button>
            <button
              onClick={() => { setResponding(false); setResponse(''); }}
              className="text-gray-400 text-sm hover:underline cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
