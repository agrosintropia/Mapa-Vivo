import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import ObservationReviewClient from './ObservationReviewClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { projectSlug: string };
}

export default async function ObservacoesPainelPage({ params }: PageProps) {
  const { projectSlug } = params;

  const session = await auth();
  if (!session?.user) redirect('/login');

  const userRole = (session.user as unknown as Record<string, unknown>).role as string | undefined;
  if (!userRole || (userRole !== 'gestor' && userRole !== 'tecnico')) {
    redirect(`/${projectSlug}/painel`);
  }

  const project = await prisma.project.findUnique({
    where: { slug: projectSlug },
    select: { id: true, name: true, slug: true },
  });

  if (!project) notFound();

  const observations = await prisma.treeObservation.findMany({
    where: { tree: { project_id: project.id } },
    include: {
      tree: {
        select: {
          qr_slug: true,
          species: { select: { common_name: true, scientific_name: true } },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  const data = observations.map((o) => ({
    id: o.id,
    type: o.type,
    description: o.description,
    audio_url: o.audio_url,
    photo_urls: o.photo_urls,
    status: o.status,
    reviewer_note: o.reviewer_note,
    user_name: o.user_name,
    created_at: o.created_at.toISOString(),
    tree: {
      qr_slug: o.tree.qr_slug,
      common_name: o.tree.species.common_name,
      scientific_name: o.tree.species.scientific_name,
    },
  }));

  return (
    <main className="min-h-screen bg-areia flex flex-col">
      <header className="bg-verde-cerrado text-white px-4 py-3 flex items-center justify-between shadow-md z-50">
        <div className="flex items-center gap-3">
          <a href={`/${project.slug}/mapa`} className="text-2xl leading-none">🌳</a>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight">{project.name}</h1>
            <p className="text-xs opacity-70">Observações dos moradores</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <a href={`/${project.slug}/painel`} className="hover:underline opacity-80 hover:opacity-100">Painel</a>
          <a href={`/${project.slug}/mapa`} className="hover:underline opacity-80 hover:opacity-100">Mapa</a>
        </nav>
      </header>
      <ObservationReviewClient observations={data} projectSlug={projectSlug} />
    </main>
  );
}
