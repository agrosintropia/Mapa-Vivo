import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';

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

  const [projects, plans, technicians, reviewRequests, totalTrees, totalSpecies, totalObservations, recentVisits] = await Promise.all([
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
    technicians: technicians.map(t => ({
      id: t.id,
      name: t.name,
      email: t.user?.email || '',
      image: t.user?.image || null,
    })),
    reviewRequests: reviewRequests.map(r => ({
      id: r.id,
      projectName: r.project.name,
      projectSlug: r.project.slug,
      entityType: r.entity_type,
      entityId: r.entity_id,
      reason: r.reason,
      status: r.status,
      createdAt: r.created_at.toISOString(),
    })),
    recentVisits: recentVisits.map(v => ({
      id: v.id,
      projectName: v.project.name,
      projectSlug: v.project.slug,
      technicianName: v.technician_name,
      purpose: v.purpose,
      status: v.status,
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
    },
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-verde-cerrado text-white px-6 py-4 flex items-center justify-between shadow-md z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌳</span>
          <div>
            <h1 className="font-display text-xl font-bold">AgroSintropia</h1>
            <p className="text-xs opacity-70">Painel Administrativo</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <a href="/projetos" className="hover:underline opacity-80 hover:opacity-100">Projetos</a>
          <a href="/" className="hover:underline opacity-80 hover:opacity-100">Site</a>
        </nav>
      </header>
      <AdminDashboard data={data} />
    </main>
  );
}
