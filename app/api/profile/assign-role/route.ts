import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const VALID_ROLES = ['gestor', 'tecnico', 'morador'];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const body = await request.json();
  const { role, projectSlug } = body;

  if (!role || !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Papel inválido' }, { status: 400 });
  }

  const existing = await prisma.profile.findUnique({
    where: { id: session.user.id },
  });

  if (existing) {
    const updated = await prisma.profile.update({
      where: { id: session.user.id },
      data: { role },
    });
    return NextResponse.json(updated);
  }

  let projectId: string | null = null;
  if (projectSlug) {
    const project = await prisma.project.findUnique({
      where: { slug: projectSlug },
    });
    if (project) projectId = project.id;
  }

  if (!projectId && role === 'gestor' && session.user.email) {
    const gestorProject = await prisma.project.findFirst({
      where: { gestor_email: session.user.email },
    });
    if (gestorProject) {
      projectId = gestorProject.id;
      await prisma.projectMember.upsert({
        where: { project_id_user_id: { project_id: gestorProject.id, user_id: session.user.id } },
        update: { role: 'gestor' },
        create: { project_id: gestorProject.id, user_id: session.user.id, role: 'gestor' },
      });
    }
  }

  if (!projectId) {
    const firstProject = await prisma.project.findFirst();
    projectId = firstProject?.id ?? null;
  }

  const profile = await prisma.profile.create({
    data: {
      id: session.user.id,
      name: session.user.name || 'Usuário',
      role,
      project_id: projectId,
    },
  });

  const projectForSlug = projectId ? await prisma.project.findUnique({ where: { id: projectId }, select: { slug: true } }) : null;

  return NextResponse.json({ ...profile, projectSlug: projectForSlug?.slug || null });
}
