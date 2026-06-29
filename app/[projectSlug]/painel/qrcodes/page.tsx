import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import QRCodesClient from './QRCodesClient';
import AppHeader from '@/components/AppHeader';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'QR Codes — Mapa Vivo',
};

interface PageProps {
  params: { projectSlug: string };
}

export default async function QRCodesPage({ params }: PageProps) {
  const { projectSlug } = params;

  const session = await auth();
  if (!session?.user) redirect('/login');

  const userRole = (session.user as unknown as Record<string, unknown>).role as string | undefined;
  const ADMIN_EMAILS = ['agrosintropia@gmail.com'];
  if (userRole !== 'admin' && !ADMIN_EMAILS.includes(session.user?.email || '')) {
    redirect(`/${projectSlug}/painel`);
  }

  const project = await prisma.project.findUnique({
    where: { slug: projectSlug },
    select: { id: true, name: true, slug: true },
  });

  if (!project) notFound();

  const trees = await prisma.tree.findMany({
    where: { project_id: project.id },
    select: {
      id: true,
      qr_slug: true,
      status: true,
      species: {
        select: { common_name: true, scientific_name: true },
      },
    },
    orderBy: { qr_slug: 'asc' },
  });

  const data = trees.map(t => ({
    id: t.id,
    qr_slug: t.qr_slug,
    status: t.status,
    common_name: t.species.common_name,
    scientific_name: t.species.scientific_name,
  }));

  return (
    <main className="min-h-screen bg-areia print:bg-white flex flex-col">
      <div className="print:hidden">
        <AppHeader
          projectName={project.name}
          projectSlug={project.slug}
          subtitle={`QR Codes · ${data.length} árvores`}
          userRole="admin"
          userName={session.user.name || undefined}
          showBack
          backHref={`/${project.slug}/painel`}
        />
      </div>
      <QRCodesClient trees={data} projectName={project.name} projectSlug={project.slug} />
    </main>
  );
}
