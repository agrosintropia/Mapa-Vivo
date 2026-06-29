import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Visitas Técnicas | Mapa Vivo',
};

const ACTION_LABELS: Record<string, string> = {
  adicao_arvore: 'Árvore adicionada',
  remocao_arvore: 'Árvore removida',
  edicao_arvore: 'Árvore editada',
  edicao_especie: 'Espécie editada',
  adicao_subarea: 'Sub-área adicionada',
  edicao_projeto: 'Projeto editado',
};

const ACTION_COLORS: Record<string, string> = {
  adicao_arvore: 'bg-green-100 text-green-700',
  remocao_arvore: 'bg-red-100 text-red-700',
  edicao_arvore: 'bg-blue-100 text-blue-700',
  edicao_especie: 'bg-purple-100 text-purple-700',
  adicao_subarea: 'bg-orange-100 text-orange-700',
  edicao_projeto: 'bg-gray-100 text-gray-700',
};

export default async function VisitasPage({ params }: { params: { projectSlug: string } }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userRole = (session.user as Record<string, unknown>).role as string | undefined;
  if (userRole !== 'tecnico' && userRole !== 'gestor') redirect('/');

  const project = await prisma.project.findUnique({
    where: { slug: params.projectSlug },
    select: { id: true, name: true, slug: true },
  });
  if (!project) notFound();

  const visits = await prisma.technicalVisit.findMany({
    where: { project_id: project.id },
    include: {
      actions: { orderBy: { created_at: 'asc' } },
    },
    orderBy: { started_at: 'desc' },
  });

  return (
    <main className="min-h-screen bg-areia flex flex-col has-bottom-nav">
      <AppHeader
        projectName={project.name}
        projectSlug={project.slug}
        subtitle="Visitas Técnicas"
        userRole={userRole!}
        userName={session.user.name || undefined}
        showBack
        backHref={`/${project.slug}/painel`}
      />

      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        {userRole === 'tecnico' && (
          <a
            href={`/${project.slug}/visita`}
            className="btn-primary inline-block text-sm"
          >
            + Iniciar nova visita técnica
          </a>
        )}

        {visits.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-gray-500">Nenhuma visita técnica registrada.</p>
          </div>
        ) : (
          visits.map(visit => {
            const additions = visit.actions.filter(a => a.type === 'adicao_arvore').length;
            const removals = visit.actions.filter(a => a.type === 'remocao_arvore').length;
            const edits = visit.actions.filter(a => a.type.startsWith('edicao')).length;

            return (
              <div key={visit.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-verde-cerrado">{visit.purpose}</h3>
                    <p className="text-sm text-gray-500">
                      {visit.technician_name} &middot;{' '}
                      {new Date(visit.started_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    visit.status === 'finalizada' ? 'bg-verde-medio/10 text-verde-medio' : 'bg-ocre/10 text-ocre'
                  }`}>
                    {visit.status === 'finalizada' ? 'Finalizada' : 'Em andamento'}
                  </span>
                </div>

                {visit.notes && (
                  <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">{visit.notes}</p>
                )}

                <div className="flex gap-4 text-xs text-gray-500 mb-3">
                  {additions > 0 && <span className="text-green-600">+{additions} adicionadas</span>}
                  {removals > 0 && <span className="text-red-600">-{removals} removidas</span>}
                  {edits > 0 && <span className="text-blue-600">{edits} editadas</span>}
                  {visit.actions.length === 0 && <span>Nenhuma ação registrada</span>}
                </div>

                {visit.actions.length > 0 && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-verde-medio hover:underline font-medium">
                      Ver {visit.actions.length} ações
                    </summary>
                    <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
                      {visit.actions.map(action => (
                        <div key={action.id} className="flex items-center gap-2 py-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLORS[action.type] || 'bg-gray-100 text-gray-600'}`}>
                            {ACTION_LABELS[action.type] || action.type}
                          </span>
                          <span className="text-gray-600 text-xs flex-1">{action.summary}</span>
                          <span className="text-gray-300 text-xs">
                            {new Date(action.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {visit.finished_at && (
                  <p className="text-xs text-gray-400 mt-2">
                    Finalizada em {new Date(visit.finished_at).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
      <BottomNav projectSlug={params.projectSlug} userRole={userRole!} />
    </main>
  );
}
