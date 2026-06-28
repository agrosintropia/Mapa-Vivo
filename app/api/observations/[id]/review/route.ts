import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const VALID_ACTIONS = ['aceita', 'rejeitada', 'revisao_online', 'pendente_visita'];

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
  });

  if (!profile || (profile.role !== 'gestor' && profile.role !== 'tecnico')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }

  const body = await request.json();
  const { action, note } = body;

  if (!action || !VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  }

  const observation = await prisma.treeObservation.findUnique({
    where: { id: params.id },
  });

  if (!observation) {
    return NextResponse.json({ error: 'Observação não encontrada' }, { status: 404 });
  }

  const updated = await prisma.treeObservation.update({
    where: { id: params.id },
    data: {
      status: action,
      reviewer_note: note || null,
    },
  });

  if (action === 'aceita' && observation.description) {
    await prisma.treeEvent.create({
      data: {
        tree_id: observation.tree_id,
        type: 'observacao',
        description: `[Relato do morador ${observation.user_name}] ${observation.description}`,
        author_role: 'gestor',
      },
    });
  }

  if (action === 'revisao_online') {
    const tree = await prisma.tree.findUnique({ where: { id: observation.tree_id } });
    if (tree) {
      await prisma.reviewRequest.create({
        data: {
          project_id: tree.project_id,
          entity_type: 'observation',
          entity_id: observation.id,
          requested_by: session.user.id,
          reason: note || `Revisão solicitada para observação de ${observation.user_name}`,
        },
      });
    }
  }

  return NextResponse.json(updated);
}
