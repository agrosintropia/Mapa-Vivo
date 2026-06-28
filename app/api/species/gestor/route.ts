import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({ where: { id: session.user.id } });
  if (!profile || profile.role !== 'gestor') {
    return NextResponse.json({ error: 'Apenas gestores podem usar esta função' }, { status: 403 });
  }

  const body = await request.json();
  const { common_name, scientific_name, family, biome, strata, description } = body;

  if (!common_name) {
    return NextResponse.json({ error: 'Nome popular obrigatório' }, { status: 400 });
  }

  const species = await prisma.species.create({
    data: {
      common_name,
      scientific_name: scientific_name || 'A confirmar',
      family: family || 'A confirmar',
      biome: biome ? [biome] : [],
      strata: strata || 'medio',
      description: description || null,
      added_by: session.user.id,
      validation_status: 'pendente_validacao',
    },
  });

  return NextResponse.json(species, { status: 201 });
}
