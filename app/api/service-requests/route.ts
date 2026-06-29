import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const VALID_TYPES = ['visita_tecnica', 'revisao_online', 'nova_area', 'outro'];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { projectId, type, description } = await request.json();

  if (!projectId || !type || !description) {
    return NextResponse.json({ error: 'Campos obrigatórios: projectId, type, description' }, { status: 400 });
  }

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
  }

  const sr = await prisma.serviceRequest.create({
    data: {
      project_id: projectId,
      requested_by: session.user.id,
      type,
      description,
    },
  });

  return NextResponse.json(sr, { status: 201 });
}
