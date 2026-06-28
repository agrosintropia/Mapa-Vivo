import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as string | undefined;
    if (userRole !== 'tecnico') {
      return NextResponse.json({ error: 'Apenas técnicos podem cadastrar espécies' }, { status: 403 });
    }

    const body = await request.json();
    const { common_name, scientific_name, family, strata, description, ecological_function, biome, subclasses } = body;

    if (!common_name) {
      return NextResponse.json({ error: 'Nome popular é obrigatório' }, { status: 400 });
    }

    const species = await prisma.species.create({
      data: {
        common_name,
        scientific_name: scientific_name || 'Não identificada',
        family: family || 'Não identificada',
        strata: strata || 'medio',
        description: description || null,
        ecological_function: ecological_function || null,
        biome: biome ? [biome] : [],
        subclasses: subclasses || [],
      },
    });

    return NextResponse.json({
      id: species.id,
      common_name: species.common_name,
      scientific_name: species.scientific_name,
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar espécie:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
