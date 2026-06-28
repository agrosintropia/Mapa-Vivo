import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import QRCodesClient from './QRCodesClient';

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
      <header className="bg-verde-cerrado text-white px-6 py-4 flex items-center justify-between shadow-md z-50 print:hidden">
        <div className="flex items-center gap-3">
          <a href={`/${project.slug}/painel`} className="text-2xl leading-none">🌳</a>
          <div>
            <h1 className="font-display text-xl font-bold">{project.name}</h1>
            <p className="text-xs opacity-70">QR Codes · {data.length} árvores</p>
          </div>
        </div>
        <a href={`/${project.slug}/painel`} className="text-sm hover:underline opacity-80 hover:opacity-100">
          Voltar ao painel
        </a>
      </header>
      <QRCodesClient trees={data} projectName={project.name} projectSlug={project.slug} />
    </main>
  );
}
