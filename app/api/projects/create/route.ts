import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as string | undefined;
    if (userRole !== 'tecnico') {
      return NextResponse.json({ error: 'Apenas técnicos podem criar projetos' }, { status: 403 });
    }

    const body = await request.json();
    const { name, type, city, state, biome, description, boundary, area_hectares, sub_areas, gestor_email } = body;

    if (!name || !type || !city || !state || !biome) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome, tipo, cidade, estado, bioma' }, { status: 400 });
    }

    let slug = slugify(name);
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const invite_code = crypto.randomUUID().slice(0, 8);

    const project = await prisma.project.create({
      data: {
        name,
        slug,
        type,
        city,
        state,
        biome,
        description: description || null,
        boundary: boundary || null,
        area_hectares: area_hectares ? parseFloat(area_hectares) : null,
        created_by: (session.user as unknown as Record<string, string>).id || null,
        gestor_email: gestor_email || null,
        invite_code,
      },
    });

    if (sub_areas && Array.isArray(sub_areas) && sub_areas.length > 0) {
      for (const sa of sub_areas) {
        if (!sa.name) continue;
        let saSlug = slugify(sa.name);
        const existingSa = await prisma.subArea.findUnique({
          where: { project_id_slug: { project_id: project.id, slug: saSlug } },
        });
        if (existingSa) {
          saSlug = `${saSlug}-${Date.now().toString(36)}`;
        }
        await prisma.subArea.create({
          data: {
            project_id: project.id,
            name: sa.name,
            slug: saSlug,
            description: sa.description || null,
            boundary: sa.boundary || null,
            area_hectares: sa.area_hectares ? parseFloat(sa.area_hectares) : null,
          },
        });
      }
    }

    return NextResponse.json({ slug: project.slug, id: project.id }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
