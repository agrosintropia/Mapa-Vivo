import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import PainelClient from '@/components/PainelClient';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { projectSlug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Painel de Gestão | Mapa Vivo`,
    description: 'Gerencie as árvores e submissões do seu projeto.',
  };
}

interface TreeRow {
  id: string;
  qr_slug: string;
  status: string;
  reliability: string;
  dbh_cm: number | null;
  height_m: number | null;
  planted_date: string | null;
  species: {
    common_name: string;
    scientific_name: string;
  };
}

interface PendingSubmission {
  id: string;
  submitted_by: string;
  notes: string | null;
  status: string;
  created_at: string;
}

export interface PainelData {
  projectName: string;
  projectSlug: string;
  trees: TreeRow[];
  pendingCount: number;
  totalTrees: number;
  recentSubmissions: PendingSubmission[];
  userRole: string;
  inviteCode?: string | null;
  pendingObservations?: number;
  initialVisitCompleted?: boolean;
}

export default async function PainelPage({ params }: PageProps) {
  const { projectSlug } = params;

  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/${projectSlug}/painel`);
  }

  const userRole = (session.user as Record<string, unknown>).role as string | undefined;
  if (!userRole) {
    redirect('/selecionar-papel');
  }
  if (userRole !== 'gestor' && userRole !== 'tecnico') {
    return (
      <main className="min-h-screen bg-areia flex flex-col">
        <header className="bg-verde-cerrado text-white px-4 py-3 flex items-center gap-3 shadow-md">
          <a href={`/${projectSlug}/mapa`} className="text-2xl leading-none">🌳</a>
          <h1 className="font-display text-lg font-bold">Mapa Vivo</h1>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="card max-w-md text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-verde-cerrado mb-2">Acesso restrito</h2>
            <p className="text-gray-600">
              Você não tem permissão para acessar o painel de gestão.
              Entre em contato com o administrador do projeto.
            </p>
          </div>
        </div>
      </main>
    );
  }

  try {
    const project = await prisma.project.findUnique({
      where: { slug: projectSlug },
      select: { id: true, name: true, slug: true, invite_code: true, gestor_email: true, initial_visit_completed: true },
    });

    if (!project) notFound();

    const trees = await prisma.tree.findMany({
      where: { project_id: project.id },
      select: {
        id: true,
        qr_slug: true,
        status: true,
        reliability: true,
        dbh_cm: true,
        height_m: true,
        planted_date: true,
        species: {
          select: { common_name: true, scientific_name: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const pendingSubmissions = await prisma.submission.findMany({
      where: { project_id: project.id },
      orderBy: { created_at: 'desc' },
      take: 20,
      select: {
        id: true,
        submitted_by: true,
        notes: true,
        status: true,
        created_at: true,
      },
    });

    const pendingCount = await prisma.submission.count({
      where: { project_id: project.id, status: 'pendente' },
    });

    const pendingObservations = await prisma.treeObservation.count({
      where: { tree: { project_id: project.id }, status: 'pendente' },
    });

    const painelData: PainelData = {
      projectName: project.name,
      projectSlug: project.slug,
      inviteCode: project.invite_code,
      pendingObservations,
      trees: trees.map(t => ({
        ...t,
        planted_date: t.planted_date?.toISOString() ?? null,
      })),
      pendingCount,
      totalTrees: trees.length,
      recentSubmissions: pendingSubmissions.map(s => ({
        ...s,
        created_at: s.created_at.toISOString(),
      })),
      userRole,
      initialVisitCompleted: project.initial_visit_completed,
    };

    return (
      <main className="min-h-screen bg-areia flex flex-col has-bottom-nav">
        <AppHeader
          projectName={project.name}
          projectSlug={project.slug}
          subtitle="Painel de Gestão"
          userRole={userRole}
          userName={session.user.name || undefined}
          showBack
        />
        <PainelClient data={painelData} />
        <BottomNav projectSlug={project.slug} userRole={userRole} pendingObservations={pendingObservations} />
      </main>
    );
  } catch (error) {
    console.error('Erro ao carregar painel:', error);
    return (
      <main className="min-h-screen bg-areia flex flex-col">
        <header className="bg-verde-cerrado text-white px-4 py-4 flex items-center gap-3">
          <a href="/" className="text-2xl">🌳</a>
          <h1 className="font-display text-xl font-bold">Mapa Vivo</h1>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="card max-w-md text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-verde-cerrado mb-2">Conexão indisponível</h2>
            <p className="text-gray-600">
              Não foi possível conectar ao banco de dados. Tente novamente em alguns instantes.
            </p>
          </div>
        </div>
      </main>
    );
  }
}
