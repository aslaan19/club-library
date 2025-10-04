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

  // Get total books count and status breakdown
  const total = await prisma.book.count();
  const available = await prisma.book.count({
    where: { status: 'AVAILABLE' },
  });
  const borrowed = await prisma.book.count({
    where: { status: 'BORROWED' },
  });

  return NextResponse.json({
    total,
    available,
    borrowed,
  });
}