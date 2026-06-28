import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import VisitSession from './VisitSession';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Visita Técnica | Mapa Vivo',
};

export default async function VisitaPage({ params }: { params: { projectSlug: string } }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userRole = (session.user as Record<string, unknown>).role as string | undefined;
  if (userRole !== 'tecnico') redirect(`/${params.projectSlug}/painel`);

  const project = await prisma.project.findUnique({
    where: { slug: params.projectSlug },
    select: { id: true, name: true, slug: true, boundary: true },
  });
  if (!project) notFound();

  const trees = await prisma.tree.findMany({
    where: { project_id: project.id, status: { not: 'removida' } },
    select: {
      id: true, lat: true, lng: true, status: true, qr_slug: true,
      dbh_cm: true, height_m: true,
      species: { select: { id: true, common_name: true, scientific_name: true } },
    },
  });

  const species = await prisma.species.findMany({
    select: {
      id: true, common_name: true, scientific_name: true, family: true,
      strata: true, description: true, ecological_function: true,
      fruiting_season: true, fauna_attracted: true, subclasses: true,
    },
    orderBy: { common_name: 'asc' },
  });

  return (
    <VisitSession
      project={{ id: project.id, name: project.name, slug: project.slug, boundary: project.boundary }}
      trees={trees.map(t => ({ ...t }))}
      species={species}
      userName={session.user.name || 'Técnico'}
    />
  );
}
