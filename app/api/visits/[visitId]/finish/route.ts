import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { visitId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const visit = await prisma.technicalVisit.findUnique({
      where: { id: params.visitId },
      include: {
        actions: true,
        project: { select: { slug: true } },
      },
    });
    if (!visit) {
      return NextResponse.json({ error: 'Visita não encontrada' }, { status: 404 });
    }
    if (visit.status === 'finalizada') {
      return NextResponse.json({ error: 'Visita já finalizada' }, { status: 400 });
    }

    const body = await request.json();

    await prisma.technicalVisit.update({
      where: { id: params.visitId },
      data: {
        status: 'finalizada',
        finished_at: new Date(),
        notes: body.notes || visit.notes,
      },
    });

    const summary = {
      additions: visit.actions.filter(a => a.type === 'adicao_arvore').length,
      removals: visit.actions.filter(a => a.type === 'remocao_arvore').length,
      edits: visit.actions.filter(a => a.type === 'edicao_arvore').length,
      species_edits: visit.actions.filter(a => a.type === 'edicao_especie').length,
      new_subareas: visit.actions.filter(a => a.type === 'adicao_subarea').length,
      total: visit.actions.length,
    };

    return NextResponse.json({ ok: true, summary, slug: visit.project.slug });
  } catch (error) {
    console.error('Erro ao finalizar visita:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
