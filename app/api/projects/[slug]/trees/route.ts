import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const project = await prisma.project.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        boundary: true,
        biome: true,
        city: true,
        state: true,
        area_hectares: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    const trees = await prisma.tree.findMany({
      where: { project_id: project.id },
      select: {
        id: true,
        lat: true,
        lng: true,
        status: true,
        reliability: true,
        qr_slug: true,
        dbh_cm: true,
        height_m: true,
        species: {
          select: {
            id: true,
            common_name: true,
            scientific_name: true,
            family: true,
            strata: true,
            subclasses: true,
            ecological_function: true,
          },
        },
      },
    });

    return NextResponse.json({ project, trees });
  } catch (error) {
    console.error('Erro ao buscar árvores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
