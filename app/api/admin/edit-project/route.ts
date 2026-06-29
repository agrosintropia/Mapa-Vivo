import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = ['agrosintropia@gmail.com'];

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { projectId, name, gestorEmail } = await request.json();
  if (!projectId) return NextResponse.json({ error: 'projectId obrigatório' }, { status: 400 });

  const data: Record<string, string> = {};
  if (name !== undefined) data.name = name;
  if (gestorEmail !== undefined) data.gestor_email = gestorEmail;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
  }

  const updated = await prisma.project.update({ where: { id: projectId }, data });
  return NextResponse.json(updated);
}
