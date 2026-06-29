import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import MapView from '@/components/MapView';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import WhatsAppHelp from '@/components/WhatsAppHelp';
import type { TreeData, ProjectData } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { projectSlug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { projectSlug } = params;
  let projectName = 'Mapa Vivo';

  try {
    const project = await prisma.project.findUnique({
      where: { slug: projectSlug },
      select: { name: true },
    });
    if (project) projectName = project.name;
  } catch {
    // DB unavailable — use default name
  }

  return {
    title: `Mapa — ${projectName} | Mapa Vivo`,
    description: `Mapa interativo das árvores de ${projectName}. Explore as espécies, filtre por subclasse e descubra cada árvore.`,
    openGraph: {
      title: `Mapa — ${projectName}`,
      description: `Mapa interativo das árvores de ${projectName}`,
      type: 'website',
      locale: 'pt_BR',
    },
  };
}

type FetchResult =
  | { status: 'ok'; project: ProjectData; trees: TreeData[] }
  | { status: 'not_found' }
  | { status: 'db_error' };

async function getProjectData(slug: string): Promise<FetchResult> {
  try {
    const project = await prisma.project.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        boundary: true,
        biome: true,
        city: true,
        state: true,
        area_hectares: true,
      },
    });

    if (!project) return { status: 'not_found' };

    const trees = await prisma.tree.findMany({
      where: { project_id: project.id },
      select: {
        id: true,
        lat: true,
        lng: true,
        status: true,
        reliability: true,
        qr_slug: true,
        dbh_cm: true,
        height_m: true,
        species: {
          select: {
            id: true,
            common_name: true,
            scientific_name: true,
            family: true,
            strata: true,
            subclasses: true,
            ecological_function: true,
          },
        },
      },
    });

    return { status: 'ok', project: project as ProjectData, trees: trees as TreeData[] };
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    return { status: 'db_error' };
  }
}

export default async function MapaPage({ params }: PageProps) {
  const { projectSlug } = params;
  const result = await getProjectData(projectSlug);

  if (result.status === 'not_found') notFound();

  if (result.status === 'db_error') {
    return (
      <main className="min-h-screen bg-areia flex flex-col">
        <header className="bg-verde-cerrado text-white px-4 py-4 flex items-center gap-3">
          <a href="/" className="text-2xl">🌳</a>
          <h1 className="font-display text-xl font-bold">Mapa Vivo</h1>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="card max-w-md text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-verde-cerrado mb-2">
              Conexão indisponível
            </h2>
            <p className="text-gray-600">
              Não foi possível conectar ao banco de dados. Tente novamente em alguns instantes.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { project, trees } = result;
  const session = await auth();
  const userRole = session?.user ? ((session.user as Record<string, unknown>).role as string) || 'morador' : 'morador';
  const showHelp = userRole === 'morador' || userRole === 'gestor';

  return (
    <main className="min-h-screen bg-areia flex flex-col has-bottom-nav">
      <AppHeader
        projectName={project.name}
        projectSlug={project.slug}
        subtitle={`${project.city}, ${project.state}`}
        userRole={userRole}
        userName={session?.user?.name || undefined}
      />
      <MapView project={project} trees={trees} projectSlug={projectSlug} />
      {session?.user && <BottomNav projectSlug={projectSlug} userRole={userRole} />}
      {showHelp && <WhatsAppHelp projectName={project.name} userName={session?.user?.name || undefined} />}
    </main>
  );
}
