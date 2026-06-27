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
    if (userRole !== 'tecnico') {
      return NextResponse.json({ error: 'Apenas técnicos podem validar árvores' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { reliability } = body;

    const validValues = ['validado_tecnico', 'pendente', 'declarado_gestor'];
    if (!validValues.includes(reliability)) {
      return NextResponse.json({ error: 'Valor de confiabilidade inválido' }, { status: 400 });
    }

    const tree = await prisma.tree.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!tree) {
      return NextResponse.json({ error: 'Árvore não encontrada' }, { status: 404 });
    }

    await prisma.tree.update({
      where: { id },
      data: { reliability },
    });

    await prisma.treeEvent.create({
      data: {
        tree_id: id,
        type: 'validacao',
        description: reliability === 'validado_tecnico'
          ? 'Dados validados por técnico'
          : `Confiabilidade alterada para: ${reliability}`,
        author_role: 'tecnico',
      },
    });

    return NextResponse.json({ id, reliability });
  } catch (error) {
    console.error('Erro ao validar árvore:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
