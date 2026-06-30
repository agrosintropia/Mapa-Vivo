import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { speciesData } from '@/lib/speciesData';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = ['agrosintropia@gmail.com'];

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({ where: { id: session.user.id } });
  const isAdmin = profile?.role === 'admin' || ADMIN_EMAILS.includes(session.user.email || '');
  if (!isAdmin) {
    return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 });
  }

  const existing = await prisma.species.findMany({
    select: { common_name: true },
  });
  const existingNames = new Set(existing.map(s => s.common_name.toLowerCase()));

  const toInsert = speciesData.filter(
    s => !existingNames.has(s.common_name.toLowerCase())
  );

  if (toInsert.length === 0) {
    return NextResponse.json({ message: 'Todas as espécies já existem', inserted: 0 });
  }

  await prisma.species.createMany({
    data: toInsert.map(s => ({
      common_name: s.common_name,
      scientific_name: s.scientific_name,
      family: s.family,
      biome: s.biome,
      strata: s.strata,
      description: s.description,
      ecological_function: s.ecological_function,
      fruiting_season: s.fruiting_season,
      fauna_attracted: s.fauna_attracted,
      subclasses: s.subclasses,
      default_carbon_factor: s.default_carbon_factor,
    })),
  });

  return NextResponse.json({
    message: `${toInsert.length} espécies inseridas com sucesso`,
    inserted: toInsert.length,
    total: existing.length + toInsert.length,
  });
}
