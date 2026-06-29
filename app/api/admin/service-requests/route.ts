import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = ['agrosintropia@gmail.com'];

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { requestId, assignedTechnicianId, status, adminNote } = await request.json();
  if (!requestId) return NextResponse.json({ error: 'requestId obrigatório' }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (assignedTechnicianId !== undefined) data.assigned_technician_id = assignedTechnicianId;
  if (status !== undefined) data.status = status;
  if (adminNote !== undefined) data.admin_note = adminNote;

  const updated = await prisma.serviceRequest.update({ where: { id: requestId }, data });
  return NextResponse.json(updated);
}
