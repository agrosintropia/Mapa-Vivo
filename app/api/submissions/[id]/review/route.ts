import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userRole = (session.user as Record<string, unknown>).role as string | undefined;
    if (!userRole || (userRole !== 'gestor' && userRole !== 'tecnico')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['aprovada', 'rejeitada', 'mais_info'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submissão não encontrada' }, { status: 404 });
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        status,
        reviewer_id: session.user.id,
      },
    });

    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch (error) {
    console.error('Erro ao revisar submissão:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
