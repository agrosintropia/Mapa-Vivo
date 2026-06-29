import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NewProjectForm from './NewProjectForm';
import AppHeader from '@/components/AppHeader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Criar Novo Projeto | Mapa Vivo',
};

export default async function NovoProjeto() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userRole = (session.user as Record<string, unknown>).role as string | undefined;
  if (userRole !== 'tecnico') {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-areia flex flex-col">
      <AppHeader
        subtitle="Criar Novo Projeto"
        userRole="tecnico"
        userName={session.user.name || undefined}
        showBack
        backHref="/projetos"
      />
      <NewProjectForm />
    </main>
  );
}
