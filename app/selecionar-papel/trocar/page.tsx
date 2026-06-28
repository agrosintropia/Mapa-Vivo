import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RoleSelector from '../RoleSelector';

export const dynamic = 'force-dynamic';

export default async function TrocarPapelPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-verde-claro/30 to-white flex items-center justify-center p-4">
      <RoleSelector userName={session.user.name || 'Usuário'} />
    </main>
  );
}
