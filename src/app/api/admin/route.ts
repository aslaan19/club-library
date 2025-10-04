// app/api/admin/stats/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // تحقق من دور الأدمن
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // جمع الإحصائيات
  const [totalBooks, activeLoans, overdueLoans, totalUsers] = await Promise.all([
    prisma.book.count(),
    prisma.loan.count({ where: { status: 'ACTIVE' } }),
    prisma.loan.count({ where: { status: 'OVERDUE' } }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
  ])

  // أكثر الكتب استعارة
  const topBooks = await prisma.book.findMany({
    include: {
      _count: {
        select: { loans: true },
      },
    },
    orderBy: {
      loans: {
        _count: 'desc',
      },
    },
    take: 5,
  })

  return NextResponse.json({
    totalBooks,
    activeLoans,
    overdueLoans,
    totalUsers,
    topBooks,
  })
}

