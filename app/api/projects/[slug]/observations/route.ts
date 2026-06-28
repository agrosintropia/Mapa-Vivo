import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const VALID_TYPES = ['saude', 'frutificacao', 'floracao', 'fauna', 'outro'];

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const formData = await request.formData();
  const treeId = formData.get('treeId') as string;
  const type = formData.get('type') as string;
  const description = (formData.get('description') as string) || null;

  if (!treeId || !type || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }

  const tree = await prisma.tree.findUnique({
    where: { id: treeId },
    select: { id: true, project: { select: { slug: true } } },
  });

  if (!tree || tree.project.slug !== params.slug) {
    return NextResponse.json({ error: 'Árvore não encontrada' }, { status: 404 });
  }

  // For MVP, store photos as data URIs (in production, use S3/Cloudinary)
  const photoUrls: string[] = [];
  const photoFiles = formData.getAll('photos') as File[];
  for (const file of photoFiles) {
    if (file.size > 0 && file.size < 5 * 1024 * 1024) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
      photoUrls.push(base64);
    }
  }

  let audioUrl: string | null = null;
  const audioFile = formData.get('audio') as File | null;
  if (audioFile && audioFile.size > 0 && audioFile.size < 10 * 1024 * 1024) {
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    audioUrl = `data:${audioFile.type};base64,${buffer.toString('base64')}`;
  }

  const observation = await prisma.treeObservation.create({
    data: {
      tree_id: treeId,
      user_id: session.user.id,
      user_name: session.user.name || 'Usuário',
      type,
      description,
      photo_urls: photoUrls,
      audio_url: audioUrl,
    },
  });

  return NextResponse.json(observation, { status: 201 });
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
  }

  const status = new URL(request.url).searchParams.get('status') || 'pendente';

  const observations = await prisma.treeObservation.findMany({
    where: {
      tree: { project_id: project.id },
      status,
    },
    include: {
      tree: {
        select: {
          qr_slug: true,
          species: { select: { common_name: true, scientific_name: true } },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return NextResponse.json(observations);
}
