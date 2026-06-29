import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import TreeForm from '@/components/TreeForm';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { projectSlug: string };
}

export const metadata: Metadata = {
  title: 'Cadastrar Árvore | Mapa Vivo',
};

export default async function NovaArvorePage({ params }: PageProps) {
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

    const species = await prisma.species.findMany({
      select: { id: true, common_name: true, scientific_name: true },
      orderBy: { common_name: 'asc' },
    });

    return (
      <main className="min-h-screen bg-areia flex flex-col has-bottom-nav">
        <AppHeader
          projectName={project.name}
          projectSlug={project.slug}
          subtitle="Cadastrar Árvore"
          userRole={userRole!}
          userName={session.user.name || undefined}
          showBack
          backHref={`/${project.slug}/painel`}
        />
        <TreeForm
          projectSlug={project.slug}
          species={species}
          userRole={userRole}
        />
        <BottomNav projectSlug={project.slug} userRole={userRole!} />
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
