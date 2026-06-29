import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import AjudaClient from './AjudaClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { projectSlug: string };
}

export default async function AjudaPage({ params }: PageProps) {
  const { projectSlug } = await params;
  const session = await auth();
  if (!session?.user) redirect('/login');

  const project = await prisma.project.findUnique({
    where: { slug: projectSlug },
    select: { id: true, name: true, slug: true, city: true, state: true },
  });
  if (!project) notFound();

  const profile = await prisma.profile.findUnique({ where: { id: session.user.id } });
  const userRole = profile?.role || 'morador';

  return (
    <main className="min-h-screen bg-areia flex flex-col has-bottom-nav">
      <AppHeader
        projectName={project.name}
        projectSlug={project.slug}
        subtitle="Ajuda"
        userRole={userRole}
        userName={session.user.name || undefined}
        showBack
      />
      <AjudaClient userRole={userRole} projectId={project.id} projectName={project.name} />
      <BottomNav projectSlug={projectSlug} userRole={userRole} />
    </main>
  );
}
