import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = ['agrosintropia@gmail.com'];

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({ where: { id: session.user.id } });
  if (profile?.role !== 'admin' && !ADMIN_EMAILS.includes(session.user.email || '')) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }

  const { projectId, setupFee, setupInstallments, setupPayment, setupPaid } = await request.json();

  await prisma.project.update({
    where: { id: projectId },
    data: {
      setup_fee: setupFee ? parseFloat(setupFee) : null,
      setup_installments: setupInstallments ? parseInt(setupInstallments) : null,
      setup_payment: setupPayment || null,
      setup_paid: setupPaid ?? false,
    },
  });

  return NextResponse.json({ ok: true });
}
