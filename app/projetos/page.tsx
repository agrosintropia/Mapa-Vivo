import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Meus Projetos | Mapa Vivo',
};

export default async function ProjetosPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userRole = (session.user as Record<string, unknown>).role as string | undefined;
  if (userRole !== 'tecnico') redirect('/');

  const projects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      city: true,
      state: true,
      biome: true,
      area_hectares: true,
      created_at: true,
      _count: { select: { trees: true, sub_areas: true, visits: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  const TYPE_LABELS: Record<string, string> = {
    condominio: 'Condomínio',
    parque: 'Parque',
    agrofloresta: 'Agrofloresta',
    incorporadora: 'Incorporadora',
  };

  return (
    <main className="min-h-screen bg-areia flex flex-col">
      <AppHeader
        subtitle="Meus Projetos"
        userRole="tecnico"
        userName={session.user.name || undefined}
      />

      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-verde-cerrado">Projetos</h2>
          <Link href="/projetos/novo" className="btn-primary text-sm">
            + Criar novo projeto
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="font-display text-xl font-bold text-verde-cerrado mb-2">
              Nenhum projeto cadastrado
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Crie seu primeiro projeto para começar a mapear as árvores de um condomínio, parque ou agrofloresta.
            </p>
            <Link href="/projetos/novo" className="btn-primary inline-block text-base">
              Criar primeiro projeto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(p => (
              <div key={p.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display text-lg font-bold text-verde-cerrado">{p.name}</h3>
                  <span className="text-xs bg-verde-medio/10 text-verde-medio px-2 py-0.5 rounded-full font-medium">
                    {TYPE_LABELS[p.type] || p.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{p.city}, {p.state} &middot; {p.biome}</p>
                {p.area_hectares && (
                  <p className="text-xs text-gray-400 mt-0.5">{p.area_hectares} hectares</p>
                )}

                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span>{p._count.trees} árvores</span>
                  <span>{p._count.sub_areas} sub-áreas</span>
                  <span>{p._count.visits} visitas</span>
                </div>

                <div className="flex gap-2 mt-4">
                  {p._count.trees === 0 ? (
                    <Link
                      href={`/${p.slug}/visita`}
                      className="btn-primary text-sm flex-1 text-center"
                    >
                      Iniciar 1a visita técnica
                    </Link>
                  ) : (
                    <>
                      <Link
                        href={`/${p.slug}/visita`}
                        className="bg-verde-medio text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-verde-medio/90 transition-colors flex-1 text-center"
                      >
                        Nova visita
                      </Link>
                      <Link
                        href={`/${p.slug}/painel`}
                        className="btn-secondary text-sm flex-1 text-center"
                      >
                        Painel
                      </Link>
                    </>
                  )}
                  <Link
                    href={`/${p.slug}/mapa`}
                    className="bg-white text-verde-cerrado border border-verde-cerrado px-4 py-2 rounded-lg text-sm font-medium hover:bg-verde-cerrado/5 transition-colors"
                  >
                    Mapa
                  </Link>
                </div>

                <p className="text-xs text-gray-300 mt-3">
                  Criado em {new Date(p.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
