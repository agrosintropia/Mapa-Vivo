import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import TreeForm from '@/components/TreeForm';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { projectSlug: string; treeId: string };
}

export const metadata: Metadata = {
  title: 'Editar Árvore | Mapa Vivo',
};

export default async function EditarArvorePage({ params }: PageProps) {
  const { projectSlug, treeId } = params;

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

    const tree = await prisma.tree.findFirst({
      where: { id: treeId, project_id: project.id },
      select: {
        id: true,
        species_id: true,
        lat: true,
        lng: true,
        dbh_cm: true,
        height_m: true,
        status: true,
        reliability: true,
        planted_date: true,
        qr_slug: true,
      },
    });
    if (!tree) notFound();

    const species = await prisma.species.findMany({
      select: { id: true, common_name: true, scientific_name: true },
      orderBy: { common_name: 'asc' },
    });

    return (
      <main className="min-h-screen bg-areia flex flex-col has-bottom-nav">
        <AppHeader
          projectName={project.name}
          projectSlug={project.slug}
          subtitle={`Editar Árvore — ${tree.qr_slug}`}
          userRole={userRole!}
          userName={session.user.name || undefined}
          showBack
          backHref={`/${project.slug}/painel`}
        />
        <TreeForm
          projectSlug={project.slug}
          species={species}
          userRole={userRole}
          editData={{
            id: tree.id,
            species_id: tree.species_id,
            lat: tree.lat,
            lng: tree.lng,
            dbh_cm: tree.dbh_cm,
            height_m: tree.height_m,
            status: tree.status,
            reliability: tree.reliability,
            planted_date: tree.planted_date?.toISOString().split('T')[0] ?? null,
            qr_slug: tree.qr_slug,
          }}
        />
        <BottomNav projectSlug={projectSlug} userRole={userRole!} />
      </main>
    );
  } catch {
    return (
      <main className="min-h-screen bg-areia flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-verde-cerrado mb-2">Conexão indisponível</h2>
          <p className="text-gray-600">Não foi possível conectar ao banco de dados.</p>
        </div>
      </main>
    );
  }
}
