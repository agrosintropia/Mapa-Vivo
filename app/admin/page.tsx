import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';
import { LogoIconDark } from '@/components/Logo';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = ['agrosintropia@gmail.com'];

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const profile = await prisma.profile.findUnique({ where: { id: session.user.id } });
  const isAdmin = profile?.role === 'admin' || ADMIN_EMAILS.includes(session.user.email || '');

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-areia flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-verde-cerrado mb-2">Acesso restrito</h2>
          <p className="text-gray-600">Painel administrativo da AgroSintropia.</p>
        </div>
      </main>
    );
  }

  if (profile && profile.role !== 'admin') {
    await prisma.profile.update({ where: { id: session.user.id }, data: { role: 'admin' } });
  }

  const [projects, plans, technicians, reviewRequests, totalTrees, totalSpecies, totalObservations, recentVisits, allBilledVisits, allBilledReviews, serviceRequests, techVisitCounts, techTreeCounts] = await Promise.all([
    prisma.project.findMany({
      include: {
        plan: true,
        _count: { select: { trees: true, members: true, visits: true, sub_areas: true } },
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.plan.findMany({ orderBy: { monthly_price: 'asc' } }),
    prisma.profile.findMany({
      where: { role: 'tecnico' },
      include: { user: { select: { email: true, image: true } } },
    }),
    prisma.reviewRequest.findMany({
      where: { status: { in: ['aberto', 'em_analise'] } },
      include: { project: { select: { name: true, slug: true } } },
      orderBy: { created_at: 'desc' },
      take: 50,
    }),
    prisma.tree.count(),
    prisma.species.count(),
    prisma.treeObservation.count(),
    prisma.technicalVisit.findMany({
      orderBy: { started_at: 'desc' },
      take: 20,
      include: {
        project: { select: { name: true, slug: true } },
        _count: { select: { actions: true } },
      },
    }),
    prisma.technicalVisit.findMany({ where: { total_billed: { not: null } } }),
    prisma.reviewRequest.findMany({ where: { review_fee: { not: null } } }),
    prisma.serviceRequest.findMany({
      orderBy: { created_at: 'desc' },
      include: { project: { select: { name: true, slug: true, gestor_email: true } } },
    }),
    prisma.technicalVisit.groupBy({ by: ['technician_id'], _count: true }),
    prisma.tree.groupBy({ by: ['project_id'], _count: true }),
  ]);

  const data = {
    projects: projects.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      type: p.type,
      city: p.city,
      state: p.state,
      status: p.status,
      planName: p.plan?.display_name || 'Sem plano',
      planId: p.plan_id,
      gestorEmail: p.gestor_email,
      setupFee: p.setup_fee,
      setupInstallments: p.setup_installments,
      setupPayment: p.setup_payment,
      setupPaid: p.setup_paid,
      planExpiresAt: p.plan_expires_at?.toISOString() || null,
      createdAt: p.created_at.toISOString(),
      treeCount: p._count.trees,
      memberCount: p._count.members,
      visitCount: p._count.visits,
      subAreaCount: p._count.sub_areas,
    })),
    plans: plans.map(p => ({
      id: p.id,
      name: p.name,
      displayName: p.display_name,
      monthlyPrice: p.monthly_price,
      treeLimit: p.tree_limit,
      visitLimit: p.visit_limit,
      features: p.features,
      active: p.active,
    })),
    technicians: technicians.map(t => {
      const visitCount = techVisitCounts.find(v => v.technician_id === t.id)?._count || 0;
      return {
        id: t.id,
        name: t.name,
        email: t.user?.email || '',
        image: t.user?.image || null,
        visitCount,
      };
    }),
    serviceRequests: serviceRequests.map(s => ({
      id: s.id,
      projectName: s.project.name,
      projectSlug: s.project.slug,
      gestorEmail: s.project.gestor_email || '',
      requestedBy: s.requested_by,
      type: s.type,
      description: s.description,
      status: s.status,
      assignedTechnicianId: s.assigned_technician_id,
      adminNote: s.admin_note,
      createdAt: s.created_at.toISOString(),
    })),
    reviewRequests: reviewRequests.map(r => ({
      id: r.id,
      projectName: r.project.name,
      projectSlug: r.project.slug,
      entityType: r.entity_type,
      entityId: r.entity_id,
      reason: r.reason,
      status: r.status,
      treeCount: r.tree_count,
      reviewFee: r.review_fee,
      billingPaid: r.billing_paid,
      createdAt: r.created_at.toISOString(),
    })),
    recentVisits: recentVisits.map(v => ({
      id: v.id,
      projectName: v.project.name,
      projectSlug: v.project.slug,
      technicianName: v.technician_name,
      purpose: v.purpose,
      status: v.status,
      baseFee: v.base_fee,
      travelCost: v.travel_cost,
      totalBilled: v.total_billed,
      billingPaid: v.billing_paid,
      startedAt: v.started_at.toISOString(),
      finishedAt: v.finished_at?.toISOString() || null,
      actionCount: v._count.actions,
    })),
    metrics: {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'ativo').length,
      totalTrees,
      totalSpecies,
      totalObservations,
      totalTechnicians: technicians.length,
      openReviews: reviewRequests.length,
      monthlyRevenue: projects.reduce((sum, p) => sum + (p.plan?.monthly_price || 0), 0),
      totalSetupFees: projects.reduce((sum, p) => sum + (p.setup_fee || 0), 0),
      setupPending: projects.filter(p => p.setup_fee && !p.setup_paid).length,
      visitRevenue: allBilledVisits.reduce((sum, v) => sum + (v.total_billed || 0), 0),
      visitsPending: allBilledVisits.filter(v => !v.billing_paid).length,
      reviewRevenue: allBilledReviews.reduce((sum, r) => sum + (r.review_fee || 0), 0),
      reviewsPending: allBilledReviews.filter(r => !r.billing_paid).length,
      openServiceRequests: serviceRequests.filter(s => s.status === 'pendente').length,
    },
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-verde-cerrado text-white px-4 py-3 flex items-center justify-between shadow-md z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8">
            <LogoIconDark />
          </div>
          <div>
            <h1 className="font-display text-base font-bold leading-tight">Mapa Vivo</h1>
            <p className="text-[10px] opacity-60">Painel Administrativo · AgroSintropia</p>
          </div>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <a href="/" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 text-xs">Site ↗</a>
          <a href="/selecionar-papel/trocar" className="bg-white/10 px-2.5 py-1 rounded-lg text-xs hover:bg-white/20 transition-colors">
            {session.user.name?.split(' ')[0] || 'Admin'}
          </a>
        </nav>
      </header>
      <AdminDashboard data={data} />
    </main>
  );
}
