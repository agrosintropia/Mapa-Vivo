import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/PrintButton';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';

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
  } catch {}

  return {
    title: `Relatório de Diversidade — ${projectName} | Mapa Vivo`,
    description: `Relatório de diversidade de espécies de ${projectName}.`,
  };
}

interface SpeciesReport {
  common_name: string;
  scientific_name: string;
  family: string;
  strata: string;
  subclasses: string[];
  count: number;
  aliveCount: number;
}

export default async function RelatorioPage({ params }: PageProps) {
  const { projectSlug } = params;

  try {
    const project = await prisma.project.findUnique({
      where: { slug: projectSlug },
      select: { id: true, name: true, slug: true, city: true, state: true, biome: true, area_hectares: true },
    });

    if (!project) notFound();

    const trees = await prisma.tree.findMany({
      where: { project_id: project.id },
      select: {
        status: true,
        species: {
          select: {
            id: true,
            common_name: true,
            scientific_name: true,
            family: true,
            strata: true,
            subclasses: true,
          },
        },
      },
    });

    const speciesMap = new Map<string, SpeciesReport>();
    for (const tree of trees) {
      const sp = tree.species;
      const existing = speciesMap.get(sp.id);
      if (existing) {
        existing.count++;
        if (tree.status === 'viva') existing.aliveCount++;
      } else {
        speciesMap.set(sp.id, {
          common_name: sp.common_name,
          scientific_name: sp.scientific_name,
          family: sp.family,
          strata: sp.strata,
          subclasses: sp.subclasses,
          count: 1,
          aliveCount: tree.status === 'viva' ? 1 : 0,
        });
      }
    }

    const speciesList = Array.from(speciesMap.values()).sort((a, b) => b.count - a.count);
    const totalTrees = trees.length;
    const totalSpecies = speciesList.length;
    const families = new Set(speciesList.map(s => s.family));
    const nativeCount = speciesList.filter(s => s.subclasses.includes('nativa')).length;
    const threatenedCount = speciesList.filter(s => s.subclasses.includes('ameacada_de_extincao')).length;

    // Shannon diversity index
    const shannon = speciesList.reduce((sum, sp) => {
      const pi = sp.count / totalTrees;
      return sum + (pi > 0 ? -pi * Math.log(pi) : 0);
    }, 0);

    // Simpson's diversity index
    const simpson = 1 - speciesList.reduce((sum, sp) => {
      const pi = sp.count / totalTrees;
      return sum + pi * pi;
    }, 0);

    const strataLabels: Record<string, string> = {
      emergente: 'Emergente', alto: 'Alto', medio: 'Médio',
      baixo: 'Baixo', arbustivo: 'Arbustivo',
    };

    const session = await auth();
    const userRole = session?.user ? ((session.user as Record<string, unknown>).role as string) || 'morador' : 'morador';

    return (
      <main className="min-h-screen bg-areia flex flex-col has-bottom-nav">
        <div className="print:hidden">
          <AppHeader
            projectName={project.name}
            projectSlug={project.slug}
            subtitle="Relatório de Diversidade"
            userRole={userRole}
            userName={session?.user?.name || undefined}
            showBack
          />
        </div>

        <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8">
          {/* Header info */}
          <section className="card">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-verde-cerrado">
                  Relatório de Diversidade de Espécies
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {project.name} — {project.city}, {project.state} — {project.biome}
                  {project.area_hectares && ` — ${project.area_hectares} ha`}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Gerado em {new Date().toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
              <a
                href={`/api/projects/${project.slug}/export`}
                className="btn-primary text-sm self-start print:hidden"
              >
                Exportar CSV
              </a>
            </div>
          </section>

          {/* Summary metrics */}
          <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <MetricCard value={totalTrees} label="Indivíduos" />
            <MetricCard value={totalSpecies} label="Espécies" />
            <MetricCard value={families.size} label="Famílias" />
            <MetricCard value={nativeCount} label="Sp. nativas" />
            <MetricCard value={threatenedCount} label="Sp. ameaçadas" />
            <MetricCard
              value={project.area_hectares
                ? (totalTrees / project.area_hectares).toFixed(0)
                : '—'}
              label="Árvores/ha"
            />
          </section>

          {/* Diversity indices */}
          <section className="card">
            <h3 className="font-display text-lg font-bold text-verde-cerrado mb-4">
              Índices de diversidade
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Índice de Shannon-Wiener (H&apos;)</p>
                <p className="text-3xl font-bold text-verde-cerrado">{shannon.toFixed(3)}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Valores entre 1,5 e 3,5 são comuns. Maior = mais diverso.
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Índice de Simpson (1-D)</p>
                <p className="text-3xl font-bold text-verde-cerrado">{simpson.toFixed(3)}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Varia de 0 a 1. Mais próximo de 1 = mais diverso.
                </p>
              </div>
            </div>
          </section>

          {/* Species table */}
          <section className="card">
            <h3 className="font-display text-lg font-bold text-verde-cerrado mb-4">
              Lista de espécies ({totalSpecies})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-medium text-gray-500">#</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-500">Nome comum</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-500 hidden md:table-cell">Científico</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-500 hidden lg:table-cell">Família</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-500">Estrato</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-500">Qtd</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-500">%</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-500 hidden md:table-cell">Classificações</th>
                  </tr>
                </thead>
                <tbody>
                  {speciesList.map((sp, i) => (
                    <tr key={sp.scientific_name} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-2 text-gray-400">{i + 1}</td>
                      <td className="py-2 px-2 font-medium text-verde-cerrado">{sp.common_name}</td>
                      <td className="py-2 px-2 italic text-gray-400 hidden md:table-cell">{sp.scientific_name}</td>
                      <td className="py-2 px-2 text-gray-500 hidden lg:table-cell">{sp.family}</td>
                      <td className="py-2 px-2 text-center text-xs">
                        {strataLabels[sp.strata] || sp.strata}
                      </td>
                      <td className="py-2 px-2 text-right font-medium">{sp.count}</td>
                      <td className="py-2 px-2 text-right text-gray-500">
                        {((sp.count / totalTrees) * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 px-2 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {sp.subclasses.includes('nativa') && (
                            <span className="text-[10px] bg-verde-medio/10 text-verde-medio px-1.5 py-0.5 rounded">Nativa</span>
                          )}
                          {sp.subclasses.includes('ameacada_de_extincao') && (
                            <span className="text-[10px] bg-terracota/10 text-terracota px-1.5 py-0.5 rounded">Ameaçada</span>
                          )}
                          {sp.subclasses.includes('frutifera') && (
                            <span className="text-[10px] bg-ocre/10 text-ocre px-1.5 py-0.5 rounded">Frutífera</span>
                          )}
                          {sp.subclasses.includes('medicinal') && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Medicinal</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Footer note */}
          <section className="text-center text-xs text-gray-400 py-4 print:mt-8">
            <p>Relatório gerado automaticamente pelo Mapa Vivo — Agrosintropia</p>
            <p className="mt-1">{project.name} — {project.city}, {project.state}</p>
          </section>
        </div>
        {session?.user && <BottomNav projectSlug={projectSlug} userRole={userRole} />}
      </main>
    );
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return (
      <main className="min-h-screen bg-areia flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-verde-cerrado mb-2">Conexão indisponível</h2>
          <p className="text-gray-600">Não foi possível conectar ao banco de dados.</p>
        </div>
      </main>
    );
  }
}

function MetricCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="card text-center py-4">
      <p className="text-2xl font-bold text-verde-cerrado">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
