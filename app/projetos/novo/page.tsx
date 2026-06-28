import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NewProjectForm from './NewProjectForm';

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
      <header className="bg-verde-cerrado text-white px-4 py-3 flex items-center justify-between shadow-md z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">🌳</span>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight">Mapa Vivo</h1>
            <p className="text-xs opacity-70">Criar Novo Projeto</p>
          </div>
        </div>
        <a href="/" className="text-sm hover:underline opacity-80">Voltar</a>
      </header>
      <NewProjectForm />
    </main>
  );
}
