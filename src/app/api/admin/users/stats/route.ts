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

  // Get users count and role breakdown
  const total = await prisma.user.count();
  const admins = await prisma.user.count({
    where: { role: 'ADMIN' },
  });
  const regularUsers = await prisma.user.count({
    where: { role: 'STUDENT' },
  });
  const activeUsers = await prisma.user.count({
    where: {
      loans: {
        some: {
          status: 'ACTIVE',
        },
      },
    },
  });

  return NextResponse.json({
    total,
    admins,
    regularUsers,
    activeUsers,
  });
}