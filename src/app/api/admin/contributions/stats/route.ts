import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get contributions count and status breakdown
  const total = await prisma.contributions.count();
  const pending = await prisma.contributions.count({
    where: { status: 'PENDING' },
  });
  const approved = await prisma.contributions.count({
    where: { status: 'APPROVED' },
  });
  const rejected = await prisma.contributions.count({
    where: { status: 'REJECTED' },
  });

  return NextResponse.json({
    total,
    pending,
    approved,
    rejected,
  });
}