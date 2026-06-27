import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const { slug } = params;

    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    const trees = await prisma.tree.findMany({
      where: { project_id: project.id },
      include: {
        species: {
          select: {
            common_name: true,
            scientific_name: true,
            family: true,
            strata: true,
            subclasses: true,
          },
        },
      },
      orderBy: { qr_slug: 'asc' },
    });

    const headers = [
      'Código', 'Espécie', 'Nome Científico', 'Família', 'Estrato',
      'Latitude', 'Longitude', 'DAP (cm)', 'Altura (m)',
      'Estado', 'Confiabilidade', 'Data de Plantio', 'Subclasses',
    ];

    const rows = trees.map(t => [
      t.qr_slug,
      t.species.common_name,
      t.species.scientific_name,
      t.species.family,
      t.species.strata,
      t.lat.toFixed(6),
      t.lng.toFixed(6),
      t.dbh_cm?.toString() ?? '',
      t.height_m?.toString() ?? '',
      t.status,
      t.reliability,
      t.planted_date?.toISOString().split('T')[0] ?? '',
      t.species.subclasses.join('; '),
    ]);

    function escapeCsv(val: string): string {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }

    const csv = [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(',')),
    ].join('\n');

    const bom = '﻿';
    const filename = `inventario-${slug}-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(bom + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Erro ao exportar:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
