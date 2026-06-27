import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import ApprovalQueue from '@/components/ApprovalQueue';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { projectSlug: string };
}

export const metadata: Metadata = {
  title: 'Fila de Revisão | Mapa Vivo',
  description: 'Revise e aprove submissões pendentes.',
};

export interface SubmissionDetail {
  id: string;
  submitted_by: string;
  lat: number;
  lng: number;
  notes: string | null;
  photo_url: string | null;
  status: string;
  created_at: string;
  species_guess: {
    common_name: string;
    scientific_name: string;
  } | null;
}

export default async function SubmissoesPage({ params }: PageProps) {
  const { projectSlug } = params;

  const session = await auth();
  if (!session?.user) redirect('/login');

  const userRole = (session.user as Record<string, unknown>).role as string | undefined;
  if (!userRole || (userRole !== 'gestor' && userRole !== 'tecnico')) {
    redirect(`/${projectSlug}/painel`);
  }

  try {
    const project = await prisma.project.findUnique({
      where: { slug: projectSlug },
      select: { id: true, name: true, slug: true },
    });

    if (!project) notFound();

    const submissions = await prisma.submission.findMany({
      where: { project_id: project.id },
      orderBy: [
        { status: 'asc' },
        { created_at: 'desc' },
      ],
      include: {
        project: { select: { slug: true } },
      },
    });

    const speciesIds = submissions
      .map(s => s.species_guess_id)
      .filter((id): id is string => id != null);

    const speciesMap = new Map<string, { common_name: string; scientific_name: string }>();
    if (speciesIds.length > 0) {
      const speciesList = await prisma.species.findMany({
        where: { id: { in: speciesIds } },
        select: { id: true, common_name: true, scientific_name: true },
      });
      for (const sp of speciesList) {
        speciesMap.set(sp.id, { common_name: sp.common_name, scientific_name: sp.scientific_name });
      }
    }

    const items: SubmissionDetail[] = submissions.map(s => ({
      id: s.id,
      submitted_by: s.submitted_by,
      lat: s.lat,
      lng: s.lng,
      notes: s.notes,
      photo_url: s.photo_url,
      status: s.status,
      created_at: s.created_at.toISOString(),
      species_guess: s.species_guess_id ? speciesMap.get(s.species_guess_id) ?? null : null,
    }));

    return (
      <main className="min-h-screen bg-areia flex flex-col">
        <header className="bg-verde-cerrado text-white px-4 py-3 flex items-center justify-between shadow-md z-50">
          <div className="flex items-center gap-3">
            <a href={`/${project.slug}/painel`} className="text-2xl leading-none">🌳</a>
            <div>
              <h1 className="font-display text-lg font-bold leading-tight">{project.name}</h1>
              <p className="text-xs opacity-70">Fila de Revisão</p>
            </div>
          </div>
          <a
            href={`/${project.slug}/painel`}
            className="text-sm hover:underline opacity-80 hover:opacity-100"
          >
            Voltar ao painel
          </a>
        </header>
        <ApprovalQueue items={items} projectSlug={project.slug} />
      </main>
    );
  } catch (error) {
    console.error('Erro ao carregar submissões:', error);
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
