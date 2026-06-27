import { prisma } from '@/lib/prisma';
import AdminQRClient from './AdminQRClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'QR Codes — Mapa Vivo Admin',
};

const STATUS_LABELS: Record<string, string> = {
  viva: 'Viva',
  doente: 'Doente',
  em_tratamento: 'Em tratamento',
  morta: 'Morta',
  removida: 'Removida',
};

async function getData() {
  try {
    const project = await prisma.project.findFirst({
      select: { id: true, name: true, slug: true },
    });

    if (!project) return { status: 'no_project' as const };

    const trees = await prisma.tree.findMany({
      where: { project_id: project.id },
      select: {
        id: true,
        qr_slug: true,
        status: true,
        species: {
          select: {
            common_name: true,
            scientific_name: true,
          },
        },
      },
      orderBy: { qr_slug: 'asc' },
    });

    return {
      status: 'ok' as const,
      project,
      trees: trees.map((t) => ({
        id: t.id,
        qr_slug: t.qr_slug,
        status: t.status,
        status_label: STATUS_LABELS[t.status] ?? t.status,
        common_name: t.species.common_name,
        scientific_name: t.species.scientific_name,
      })),
    };
  } catch (error) {
    console.error('Erro ao buscar dados para QR codes:', error);
    return { status: 'db_error' as const };
  }
}

export default async function AdminQRPage() {
  const result = await getData();

  if (result.status === 'db_error') {
    return (
      <main className="min-h-screen bg-areia p-8">
        <div className="max-w-4xl mx-auto card text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-verde-cerrado mb-2">Conexão indisponível</h2>
          <p className="text-gray-600">Não foi possível conectar ao banco de dados.</p>
        </div>
      </main>
    );
  }

  if (result.status === 'no_project') {
    return (
      <main className="min-h-screen bg-areia p-8">
        <div className="max-w-4xl mx-auto card text-center">
          <div className="text-4xl mb-4">🌱</div>
          <h2 className="text-xl font-bold text-verde-cerrado mb-2">Nenhum projeto encontrado</h2>
          <p className="text-gray-600">Crie um projeto e cadastre árvores primeiro.</p>
        </div>
      </main>
    );
  }

  const { project, trees } = result;

  return (
    <main className="min-h-screen bg-areia print:bg-white">
      <header className="bg-verde-cerrado text-white px-6 py-4 flex items-center gap-3 print:hidden">
        <a href="/" className="text-2xl">🌳</a>
        <div>
          <h1 className="font-display text-xl font-bold">QR Codes</h1>
          <p className="text-xs opacity-70">{project.name} · {trees.length} árvores</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 print:px-0 print:py-0">
        <AdminQRClient trees={trees} projectName={project.name} />
      </div>
    </main>
  );
}
