import LogoShowcase from '@/components/LogoOptions';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = ['agrosintropia@gmail.com'];

export default async function LogosPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (!ADMIN_EMAILS.includes(session.user.email || '')) redirect('/');

  return (
    <main className="min-h-screen bg-areia">
      <header className="bg-verde-cerrado text-white px-6 py-4 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <a href="/admin" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </a>
          <h1 className="font-display text-lg font-bold">Opções de Logomarca</h1>
        </div>
      </header>
      <div className="max-w-3xl mx-auto">
        <LogoShowcase />
      </div>
    </main>
  );
}
