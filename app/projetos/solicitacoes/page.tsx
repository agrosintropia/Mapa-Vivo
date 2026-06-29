import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  atribuido: { label: 'Atribuído', color: 'bg-blue-100 text-blue-800' },
  em_andamento: { label: 'Em andamento', color: 'bg-verde-medio/20 text-verde-cerrado' },
  concluido: { label: 'Concluído', color: 'bg-green-100 text-green-800' },
  recusado: { label: 'Recusado', color: 'bg-red-100 text-red-800' },
};

const TYPE_LABELS: Record<string, string> = {
  visita_tecnica: 'Visita técnica presencial',
  revisao_online: 'Revisão técnica online',
  nova_area: 'Setup de nova área',
  outro: 'Outro',
};

export default async function SolicitacoesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const profile = await prisma.profile.findUnique({ where: { id: session.user.id } });
  if (!profile || profile.role !== 'tecnico') redirect('/');

  const requests = await prisma.serviceRequest.findMany({
    where: { assigned_technician_id: session.user.id },
    include: { project: { select: { name: true, slug: true } } },
    orderBy: { created_at: 'desc' },
  });

  return (
    <main className="min-h-screen bg-areia">
      <header className="bg-verde-cerrado text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <Link href="/projetos" className="text-lg">←</Link>
        <h1 className="font-display text-lg font-bold">Minhas Solicitações</h1>
      </header>
      <div className="p-4 max-w-2xl mx-auto space-y-3">
        {requests.length === 0 ? (
          <div className="card text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm">Nenhuma solicitação atribuída a você.</p>
          </div>
        ) : (
          requests.map((r) => {
            const st = STATUS_LABELS[r.status] || { label: r.status, color: 'bg-gray-100 text-gray-600' };
            return (
              <div key={r.id} className="card space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-700">{TYPE_LABELS[r.type] || r.type}</p>
                    <p className="text-xs text-gray-400">{r.project.name}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                </div>
                <p className="text-sm text-gray-600">{r.description}</p>
                {r.admin_note && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded p-2">Nota do admin: {r.admin_note}</p>
                )}
                <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
