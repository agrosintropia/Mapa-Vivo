import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import RoleSelector from './RoleSelector';

export const dynamic = 'force-dynamic';

export default async function SelecionarPapelPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const existing = await prisma.profile.findUnique({
    where: { id: session.user.id },
  });

  if (existing) {
    const project = existing.project_id
      ? await prisma.project.findUnique({ where: { id: existing.project_id } })
      : await prisma.project.findFirst();
    redirect(project ? `/${project.slug}/painel` : '/');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-verde-claro/30 to-white flex items-center justify-center p-4">
      <RoleSelector userName={session.user.name || 'Usuário'} />
    </main>
  );
}
