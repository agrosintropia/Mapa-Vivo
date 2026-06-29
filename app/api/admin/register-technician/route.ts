import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = ['agrosintropia@gmail.com'];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { email } = await request.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado. O técnico precisa fazer login pelo menos uma vez com este email Google.' }, { status: 404 });
  }

  const existing = await prisma.profile.findUnique({ where: { id: user.id } });
  if (existing) {
    if (existing.role === 'tecnico') {
      return NextResponse.json({ error: 'Este usuário já é técnico.' }, { status: 409 });
    }
    await prisma.profile.update({ where: { id: user.id }, data: { role: 'tecnico' } });
  } else {
    await prisma.profile.create({
      data: { id: user.id, name: user.name || 'Técnico', role: 'tecnico' },
    });
  }

  return NextResponse.json({ ok: true });
}
