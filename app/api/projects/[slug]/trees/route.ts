import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

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

function generateQrSlug(): string {
  const id = uuidv4().split('-')[0];
  return `mv-${id}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as string | undefined;
    if (!userRole || (userRole !== 'gestor' && userRole !== 'tecnico')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const { slug } = params;
    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { species_id, lat, lng, dbh_cm, height_m, status, planted_date, reliability } = body;

    if (!species_id || typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: 'Coordenadas inválidas' }, { status: 400 });
    }

    const qr_slug = generateQrSlug();

    const tree = await prisma.tree.create({
      data: {
        project_id: project.id,
        species_id,
        lat,
        lng,
        dbh_cm: dbh_cm ?? null,
        height_m: height_m ?? null,
        status: status || 'viva',
        reliability: reliability || 'pendente',
        planted_date: planted_date ? new Date(planted_date) : null,
        qr_slug,
      },
    });

    await prisma.treeEvent.create({
      data: {
        tree_id: tree.id,
        type: 'plantio',
        description: 'Árvore cadastrada no sistema',
        author_role: userRole,
      },
    });

    return NextResponse.json({ id: tree.id, qr_slug: tree.qr_slug }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar árvore:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as string | undefined;
    if (!userRole || (userRole !== 'gestor' && userRole !== 'tecnico')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const { slug } = params;
    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    const url = new URL(request.url);
    const treeId = url.searchParams.get('id');
    if (!treeId) {
      return NextResponse.json({ error: 'ID da árvore é obrigatório' }, { status: 400 });
    }

    const existing = await prisma.tree.findFirst({
      where: { id: treeId, project_id: project.id },
      select: { id: true, qr_slug: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Árvore não encontrada' }, { status: 404 });
    }

    const body = await request.json();
    const { species_id, lat, lng, dbh_cm, height_m, status, planted_date, reliability } = body;

    await prisma.tree.update({
      where: { id: treeId },
      data: {
        species_id,
        lat,
        lng,
        dbh_cm: dbh_cm ?? null,
        height_m: height_m ?? null,
        status: status || 'viva',
        reliability: reliability || existing.qr_slug,
        planted_date: planted_date ? new Date(planted_date) : null,
      },
    });

    await prisma.treeEvent.create({
      data: {
        tree_id: treeId,
        type: 'atualizacao_estado',
        description: 'Dados da árvore atualizados',
        author_role: userRole,
      },
    });

    return NextResponse.json({ id: treeId, qr_slug: existing.qr_slug });
  } catch (error) {
    console.error('Erro ao atualizar árvore:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
