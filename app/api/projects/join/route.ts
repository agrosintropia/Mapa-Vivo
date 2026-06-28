import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { invite_code } = await request.json();
  if (!invite_code) {
    return NextResponse.json({ error: 'Código de convite obrigatório' }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { invite_code },
    select: { id: true, slug: true, name: true, gestor_email: true },
  });

  if (!project) {
    return NextResponse.json({ error: 'Código de convite inválido' }, { status: 404 });
  }

  const existing = await prisma.projectMember.findUnique({
    where: { project_id_user_id: { project_id: project.id, user_id: session.user.id } },
  });

  if (existing) {
    return NextResponse.json({ slug: project.slug, already_member: true });
  }

  const isGestor = project.gestor_email && session.user.email === project.gestor_email;

  await prisma.projectMember.create({
    data: {
      project_id: project.id,
      user_id: session.user.id,
      role: isGestor ? 'gestor' : 'morador',
    },
  });

  if (isGestor) {
    await prisma.profile.upsert({
      where: { id: session.user.id },
      update: { role: 'gestor', project_id: project.id },
      create: { id: session.user.id, name: session.user.name || '', role: 'gestor', project_id: project.id },
    });
  }

  return NextResponse.json({ slug: project.slug, role: isGestor ? 'gestor' : 'morador' }, { status: 201 });
}
