import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Entrar | Mapa Vivo',
  description: 'Faça login para acessar o painel de gestão do Mapa Vivo.',
};

interface LoginPageProps {
  searchParams: { callbackUrl?: string };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) {
    const callbackUrl = searchParams.callbackUrl;
    if (callbackUrl && callbackUrl.startsWith('/')) {
      redirect(callbackUrl);
    }
    redirect('/selecionar-papel');
  }

  return (
    <main className="min-h-screen bg-areia flex flex-col">
      <header className="bg-verde-cerrado text-white px-4 py-4 flex items-center gap-3">
        <a href="/" className="text-2xl">🌳</a>
        <h1 className="font-display text-xl font-bold">Mapa Vivo</h1>
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        <LoginClient />
      </div>
    </main>
  );
}
