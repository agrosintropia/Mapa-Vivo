import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { slug } = params;
  const project = await prisma.project.findUnique({
    where: { slug },
    select: { id: true, gestor_email: true },
  });
  if (!project) {
    return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
  }

  const residents = await prisma.authorizedResident.findMany({
    where: { project_id: project.id },
    orderBy: { created_at: 'desc' },
  });

  return NextResponse.json(residents);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const userRole = (session.user as unknown as Record<string, unknown>).role as string | undefined;
  if (userRole !== 'gestor' && userRole !== 'admin') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }

  const { slug } = params;
  const project = await prisma.project.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!project) {
    return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
  }

  const { name, email, phone } = await request.json();
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Nome e email são obrigatórios' }, { status: 400 });
  }

  const existing = await prisma.authorizedResident.findUnique({
    where: { project_id_email: { project_id: project.id, email: email.trim().toLowerCase() } },
  });
  if (existing) {
    return NextResponse.json({ error: 'Email já cadastrado neste projeto' }, { status: 409 });
  }

  const resident = await prisma.authorizedResident.create({
    data: {
      project_id: project.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
    },
  });

  return NextResponse.json(resident, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const userRole = (session.user as unknown as Record<string, unknown>).role as string | undefined;
  if (userRole !== 'gestor' && userRole !== 'admin') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }

  const url = new URL(request.url);
  const residentId = url.searchParams.get('id');
  if (!residentId) {
    return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
  }

  await prisma.authorizedResident.delete({ where: { id: residentId } });
  return NextResponse.json({ ok: true });
}
