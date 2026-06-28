import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    const visits = await prisma.technicalVisit.findMany({
      where: { project_id: project.id },
      include: {
        actions: { orderBy: { created_at: 'asc' } },
      },
      orderBy: { started_at: 'desc' },
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error('Erro ao listar visitas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as string | undefined;
    if (userRole !== 'tecnico') {
      return NextResponse.json({ error: 'Apenas técnicos podem iniciar visitas' }, { status: 403 });
    }

    const project = await prisma.project.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    const activeVisit = await prisma.technicalVisit.findFirst({
      where: {
        project_id: project.id,
        technician_id: (session.user as unknown as Record<string, string>).id,
        status: 'em_andamento',
      },
    });
    if (activeVisit) {
      return NextResponse.json({ id: activeVisit.id, existing: true });
    }

    const body = await request.json();
    const { purpose } = body;

    if (!purpose) {
      return NextResponse.json({ error: 'Informe a finalidade da visita' }, { status: 400 });
    }

    const visit = await prisma.technicalVisit.create({
      data: {
        project_id: project.id,
        technician_id: (session.user as unknown as Record<string, string>).id,
        technician_name: session.user.name || 'Técnico',
        purpose,
      },
    });

    return NextResponse.json({ id: visit.id }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar visita:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
