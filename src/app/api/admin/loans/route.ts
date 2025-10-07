import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LoanStatus } from '@prisma/client'; // Import the enum

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '10');
  const skip = (page - 1) * limit;

  // Cast status to LoanStatus enum
  const where = status && status !== 'ALL' 
    ? { status: status as LoanStatus } 
    : {};

  const loans = await prisma.loan.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      book: {
        select: {
          id: true,
          title: true,
          author: true,
          coverImage: true,
        },
      },
    },
    orderBy: {
      borrowDate: 'desc',
    },
    skip,
    take: limit,
  });

  const total = await prisma.loan.count({ where });

  return NextResponse.json({
    loans,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}