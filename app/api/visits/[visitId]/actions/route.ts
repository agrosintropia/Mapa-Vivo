import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

function generateQrSlug(): string {
  return `mv-${uuidv4().split('-')[0]}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { visitId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as string | undefined;
    if (userRole !== 'tecnico') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const visit = await prisma.technicalVisit.findUnique({
      where: { id: params.visitId },
      include: { project: { select: { id: true, slug: true } } },
    });
    if (!visit || visit.status !== 'em_andamento') {
      return NextResponse.json({ error: 'Visita não encontrada ou já finalizada' }, { status: 404 });
    }

    const body = await request.json();
    const { action_type } = body;

    switch (action_type) {
      case 'adicao_arvore': {
        const { species_id, lat, lng, dbh_cm, height_m, status, photo_url, planted_date, notes } = body;
        if (!species_id || typeof lat !== 'number' || typeof lng !== 'number') {
          return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
        }
        const tree = await prisma.tree.create({
          data: {
            project_id: visit.project_id,
            species_id,
            lat, lng,
            dbh_cm: dbh_cm ?? null,
            height_m: height_m ?? null,
            status: status || 'viva',
            reliability: 'validado_tecnico',
            photo_url: photo_url ?? null,
            planted_date: planted_date ? new Date(planted_date) : null,
            qr_slug: generateQrSlug(),
          },
        });
        await prisma.treeEvent.create({
          data: {
            tree_id: tree.id,
            type: 'plantio',
            description: notes ? `Cadastrada em visita técnica: ${notes}` : 'Cadastrada em visita técnica',
            author_role: 'tecnico',
          },
        });
        const species = await prisma.species.findUnique({ where: { id: species_id }, select: { common_name: true } });
        await prisma.visitAction.create({
          data: {
            visit_id: visit.id,
            type: 'adicao_arvore',
            entity_type: 'tree',
            entity_id: tree.id,
            summary: `Árvore adicionada: ${species?.common_name || 'espécie'}`,
            details: { qr_slug: tree.qr_slug, lat, lng },
          },
        });
        return NextResponse.json({ tree_id: tree.id, qr_slug: tree.qr_slug }, { status: 201 });
      }

      case 'remocao_arvore': {
        const { tree_id, reason } = body;
        const tree = await prisma.tree.findFirst({
          where: { id: tree_id, project_id: visit.project_id },
          include: { species: { select: { common_name: true } } },
        });
        if (!tree) {
          return NextResponse.json({ error: 'Árvore não encontrada' }, { status: 404 });
        }
        await prisma.tree.update({
          where: { id: tree_id },
          data: { status: 'removida' },
        });
        await prisma.treeEvent.create({
          data: {
            tree_id,
            type: 'atualizacao_estado',
            description: reason || 'Removida em visita técnica',
            author_role: 'tecnico',
          },
        });
        await prisma.visitAction.create({
          data: {
            visit_id: visit.id,
            type: 'remocao_arvore',
            entity_type: 'tree',
            entity_id: tree_id,
            summary: `Árvore removida: ${tree.species.common_name} (${tree.qr_slug})`,
            details: { reason, qr_slug: tree.qr_slug },
          },
        });
        return NextResponse.json({ ok: true });
      }

      case 'edicao_arvore': {
        const { tree_id, changes } = body;
        const tree = await prisma.tree.findFirst({
          where: { id: tree_id, project_id: visit.project_id },
          include: { species: { select: { common_name: true } } },
        });
        if (!tree) {
          return NextResponse.json({ error: 'Árvore não encontrada' }, { status: 404 });
        }
        const updateData: Record<string, unknown> = {};
        if (changes.species_id) updateData.species_id = changes.species_id;
        if (changes.dbh_cm !== undefined) updateData.dbh_cm = changes.dbh_cm;
        if (changes.height_m !== undefined) updateData.height_m = changes.height_m;
        if (changes.status) updateData.status = changes.status;
        if (changes.lat !== undefined) updateData.lat = changes.lat;
        if (changes.lng !== undefined) updateData.lng = changes.lng;
        if (changes.photo_url !== undefined) updateData.photo_url = changes.photo_url;

        await prisma.tree.update({ where: { id: tree_id }, data: updateData });
        await prisma.treeEvent.create({
          data: {
            tree_id,
            type: 'atualizacao_estado',
            description: 'Dados atualizados em visita técnica',
            author_role: 'tecnico',
          },
        });
        const changedFields = Object.keys(updateData).join(', ');
        await prisma.visitAction.create({
          data: {
            visit_id: visit.id,
            type: 'edicao_arvore',
            entity_type: 'tree',
            entity_id: tree_id,
            summary: `Árvore editada: ${tree.species.common_name} (${tree.qr_slug}) — ${changedFields}`,
            details: JSON.parse(JSON.stringify({ changes: updateData, previous: { dbh_cm: tree.dbh_cm, height_m: tree.height_m, status: tree.status } })),
          },
        });
        return NextResponse.json({ ok: true });
      }

      case 'edicao_especie': {
        const { species_id, changes: speciesChanges } = body;
        const species = await prisma.species.findUnique({ where: { id: species_id } });
        if (!species) {
          return NextResponse.json({ error: 'Espécie não encontrada' }, { status: 404 });
        }
        const speciesUpdate: Record<string, unknown> = {};
        for (const key of ['common_name', 'scientific_name', 'family', 'strata', 'description', 'ecological_function', 'fruiting_season', 'fauna_attracted']) {
          if (speciesChanges[key] !== undefined) speciesUpdate[key] = speciesChanges[key];
        }
        if (speciesChanges.subclasses) speciesUpdate.subclasses = speciesChanges.subclasses;

        await prisma.species.update({ where: { id: species_id }, data: speciesUpdate });
        await prisma.visitAction.create({
          data: {
            visit_id: visit.id,
            type: 'edicao_especie',
            entity_type: 'species',
            entity_id: species_id,
            summary: `Espécie editada: ${species.common_name}`,
            details: JSON.parse(JSON.stringify({ changes: speciesUpdate })),
          },
        });
        return NextResponse.json({ ok: true });
      }

      case 'adicao_subarea': {
        const { name, description: saDesc, boundary: saBoundary, area_hectares: saArea } = body;
        if (!name) {
          return NextResponse.json({ error: 'Nome da sub-área obrigatório' }, { status: 400 });
        }
        const saSlug = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const subArea = await prisma.subArea.create({
          data: {
            project_id: visit.project_id,
            name,
            slug: `${saSlug}-${Date.now().toString(36)}`,
            description: saDesc || null,
            boundary: saBoundary || null,
            area_hectares: saArea ? parseFloat(saArea) : null,
          },
        });
        await prisma.visitAction.create({
          data: {
            visit_id: visit.id,
            type: 'adicao_subarea',
            entity_type: 'sub_area',
            entity_id: subArea.id,
            summary: `Sub-área adicionada: ${name}`,
          },
        });
        return NextResponse.json({ sub_area_id: subArea.id }, { status: 201 });
      }

      default:
        return NextResponse.json({ error: 'Tipo de ação inválido' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro ao executar ação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
