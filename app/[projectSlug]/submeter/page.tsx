import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import SubmissionForm from '@/components/SubmissionForm';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { projectSlug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: 'Reportar Ocorrência | Mapa Vivo',
    description: 'Reporte uma árvore ou ocorrência no projeto.',
  };
}

export default async function SubmeterPage({ params }: PageProps) {
  const { projectSlug } = params;

  try {
    const project = await prisma.project.findUnique({
      where: { slug: projectSlug },
      select: { id: true, name: true, slug: true },
    });

    if (!project) notFound();

    const species = await prisma.species.findMany({
      select: { id: true, common_name: true, scientific_name: true },
      orderBy: { common_name: 'asc' },
    });

    return (
      <main className="min-h-screen bg-areia flex flex-col">
        <header className="bg-verde-cerrado text-white px-4 py-3 flex items-center gap-3 shadow-md z-50">
          <a href={`/${project.slug}/mapa`} className="text-2xl leading-none">🌳</a>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight">{project.name}</h1>
            <p className="text-xs opacity-70">Reportar Ocorrência</p>
          </div>
        </header>
        <SubmissionForm
          projectSlug={project.slug}
          species={species.map(s => ({
            id: s.id,
            common_name: s.common_name,
            scientific_name: s.scientific_name,
          }))}
        />
      </main>
    );
  } catch {
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
            <p className="text-gray-600">Não foi possível conectar ao banco de dados.</p>
          </div>
        </div>
      </main>
    );
  }
}
