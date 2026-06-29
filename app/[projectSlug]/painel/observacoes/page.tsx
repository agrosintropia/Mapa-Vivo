import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import ObservationReviewClient from './ObservationReviewClient';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';

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
    <main className="min-h-screen bg-areia flex flex-col has-bottom-nav">
      <AppHeader
        projectName={project.name}
        projectSlug={project.slug}
        subtitle="Observações dos moradores"
        userRole={userRole!}
        userName={session.user.name || undefined}
        showBack
        backHref={`/${project.slug}/painel`}
      />
      <ObservationReviewClient observations={data} projectSlug={projectSlug} />
      <BottomNav projectSlug={projectSlug} userRole={userRole!} />
    </main>
  );
}
