import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const { slug } = params;

    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { submitted_by, species_guess_id, lat, lng, notes } = body;

    if (!submitted_by || typeof submitted_by !== 'string' || submitted_by.trim().length === 0) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'Coordenadas inválidas' }, { status: 400 });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: 'Coordenadas fora do intervalo válido' }, { status: 400 });
    }

    const submission = await prisma.submission.create({
      data: {
        project_id: project.id,
        submitted_by: submitted_by.trim(),
        species_guess_id: species_guess_id || null,
        lat,
        lng,
        notes: notes || null,
        status: 'pendente',
      },
    });

    return NextResponse.json({ id: submission.id }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar submissão:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
