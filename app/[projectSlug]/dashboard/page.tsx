import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import WhatsAppHelp from '@/components/WhatsAppHelp';
import type { ProjectData } from '@/lib/types';

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
    // DB unavailable
  }

  return {
    title: `Dashboard Ambiental — ${projectName} | Mapa Vivo`,
    description: `Painel ambiental de ${projectName}: estatísticas de árvores, carbono estocado e distribuição de espécies.`,
    openGraph: {
      title: `Dashboard Ambiental — ${projectName}`,
      description: `Painel ambiental de ${projectName}`,
      type: 'website',
      locale: 'pt_BR',
    },
  };
}

interface TreeWithSpecies {
  id: string;
  status: string;
  dbh_cm: number | null;
  height_m: number | null;
  species: {
    id: string;
    common_name: string;
    scientific_name: string;
    strata: string;
    subclasses: string[];
    default_carbon_factor: number | null;
  };
}

export interface DashboardStats {
  totalTrees: number;
  totalSpecies: number;
  nativePercent: number;
  threatenedSpeciesCount: number;
  carbon: {
    totalBiomassKg: number;
    totalCarbonKg: number;
    totalCO2eqKg: number;
    treesIncluded: number;
    treesExcluded: number;
  };
  byStrata: { name: string; count: number }[];
  bySubclass: { key: string; label: string; count: number }[];
  byStatus: { name: string; count: number }[];
}

type FetchResult =
  | { status: 'ok'; project: ProjectData; stats: DashboardStats }
  | { status: 'not_found' }
  | { status: 'db_error' };

async function getDashboardData(slug: string): Promise<FetchResult> {
  try {
    const project = await prisma.project.findUnique({
      where: { slug },
      select: {
        id: true, name: true, slug: true, boundary: true,
        biome: true, city: true, state: true, area_hectares: true,
      },
    });

    if (!project) return { status: 'not_found' };

    const trees: TreeWithSpecies[] = await prisma.tree.findMany({
      where: { project_id: project.id },
      select: {
        id: true, status: true, dbh_cm: true, height_m: true,
        species: {
          select: {
            id: true, common_name: true, scientific_name: true,
            strata: true, subclasses: true, default_carbon_factor: true,
          },
        },
      },
    });

    // Import subclass labels
    const { SUBCLASSES } = await import('@/lib/subclasses');

    // Summary
    const totalTrees = trees.length;
    const speciesIds = new Set(trees.map(t => t.species.id));
    const totalSpecies = speciesIds.size;

    // Native percentage
    const nativeTreeCount = trees.filter(t => t.species.subclasses.includes('nativa')).length;
    const nativePercent = totalTrees > 0 ? Math.round((nativeTreeCount / totalTrees) * 100) : 0;

    // Threatened species count
    const threatenedSpeciesIds = new Set(
      trees
        .filter(t => t.species.subclasses.includes('ameacada_de_extincao'))
        .map(t => t.species.id)
    );
    const threatenedSpeciesCount = threatenedSpeciesIds.size;

    // Carbon calculation
    let totalBiomassKg = 0;
    let treesIncluded = 0;
    let treesExcluded = 0;

    for (const tree of trees) {
      const { dbh_cm, height_m } = tree;
      const cf = tree.species.default_carbon_factor;
      if (dbh_cm != null && height_m != null && cf != null) {
        totalBiomassKg += cf * (dbh_cm ** 2) * height_m / 1000;
        treesIncluded++;
      } else {
        treesExcluded++;
      }
    }

    const totalCarbonKg = totalBiomassKg * 0.47;
    const totalCO2eqKg = totalCarbonKg * 3.67;

    // Distribution by strata
    const strataMap = new Map<string, number>();
    for (const tree of trees) {
      const s = tree.species.strata;
      strataMap.set(s, (strataMap.get(s) || 0) + 1);
    }
    const strataLabels: Record<string, string> = {
      emergente: 'Emergente', alto: 'Alto', medio: 'Médio',
      baixo: 'Baixo', arbustivo: 'Arbustivo',
    };
    const byStrata = Array.from(strataMap.entries())
      .map(([key, count]) => ({ name: strataLabels[key] || key, count }))
      .sort((a, b) => b.count - a.count);

    // Distribution by subclass
    const subclassMap = new Map<string, number>();
    for (const tree of trees) {
      for (const sc of tree.species.subclasses) {
        subclassMap.set(sc, (subclassMap.get(sc) || 0) + 1);
      }
    }
    const bySubclass = SUBCLASSES.map(sc => ({
      key: sc.key,
      label: sc.label,
      count: subclassMap.get(sc.key) || 0,
    })).filter(sc => sc.count > 0).sort((a, b) => b.count - a.count);

    // Distribution by status
    const statusMap = new Map<string, number>();
    for (const tree of trees) {
      statusMap.set(tree.status, (statusMap.get(tree.status) || 0) + 1);
    }
    const statusLabels: Record<string, string> = {
      viva: 'Viva', doente: 'Doente', em_tratamento: 'Em tratamento',
      morta: 'Morta', removida: 'Removida',
    };
    const byStatus = Array.from(statusMap.entries())
      .map(([key, count]) => ({ name: statusLabels[key] || key, count }))
      .sort((a, b) => b.count - a.count);

    const stats: DashboardStats = {
      totalTrees, totalSpecies, nativePercent, threatenedSpeciesCount,
      carbon: { totalBiomassKg, totalCarbonKg, totalCO2eqKg, treesIncluded, treesExcluded },
      byStrata, bySubclass, byStatus,
    };

    return { status: 'ok', project: project as ProjectData, stats };
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    return { status: 'db_error' };
  }
}

export default async function DashboardPage({ params }: PageProps) {
  const { projectSlug } = params;
  const result = await getDashboardData(projectSlug);

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

  const { project, stats } = result;
  const session = await auth();
  const userRole = session?.user ? ((session.user as Record<string, unknown>).role as string) || 'morador' : 'morador';
  const showHelp = userRole === 'morador' || userRole === 'gestor';

  return (
    <main className="min-h-screen bg-areia flex flex-col has-bottom-nav">
      <AppHeader
        projectName={project.name}
        projectSlug={project.slug}
        subtitle="Dashboard Ambiental"
        userRole={userRole}
        userName={session?.user?.name || undefined}
        showBack
      />
      <Dashboard stats={stats} projectName={project.name} />
      {session?.user && <BottomNav projectSlug={projectSlug} userRole={userRole} />}
      {showHelp && <WhatsAppHelp projectName={project.name} userName={session?.user?.name || undefined} />}
    </main>
  );
}
