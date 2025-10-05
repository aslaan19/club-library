// app/api/admin/reports/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subDays, subMonths, subYears } from 'date-fns'

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)
  const timeframe = searchParams.get('timeframe') || 'month'

  // حساب التاريخ بناءً على الفترة
  let startDate: Date
  switch (timeframe) {
    case 'week':
      startDate = subDays(new Date(), 7)
      break
    case 'year':
      startDate = subYears(new Date(), 1)
      break
    case 'month':
    default:
      startDate = subMonths(new Date(), 1)
      break
  }

  try {
    // 1. الإحصائيات العامة
    const [
      totalBooks,
      totalUsers,
      totalLoans,
      activeLoans,
      overdueLoans,
      returnedLoans,
    ] = await Promise.all([
      prisma.book.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.loan.count({ where: { createdAt: { gte: startDate } } }),
      prisma.loan.count({ where: { status: 'ACTIVE' } }),
      prisma.loan.count({ where: { status: 'OVERDUE' } }),
      prisma.loan.count({
        where: {
          status: 'RETURNED',
          createdAt: { gte: startDate },
        },
      }),
    ])

    // 2. أكثر الكتب استعارة
    const mostBorrowedBooks = await prisma.book.findMany({
      include: {
        _count: {
          select: {
            loans: {
              where: { createdAt: { gte: startDate } },
            },
          },
        },
      },
      orderBy: {
        loans: {
          _count: 'desc',
        },
      },
      take: 5,
    })

    const formattedMostBorrowed = mostBorrowedBooks
      .map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        borrowCount: book._count.loans,
      }))
      .filter((book) => book.borrowCount > 0)

    // 3. أكثر المتطوعين
    const topContributors = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        contributions: {
          some: {},
        },
      },
      include: {
        _count: {
          select: {
            contributions: true,
          },
        },
      },
      orderBy: {
        contributions: {
          _count: 'desc',
        },
      },
      take: 5,
    })

    const formattedContributors = topContributors.map((user) => ({
      id: user.id,
      name: user.name,
      contributionCount: user._count.contributions,
    }))

    // 4. النشاطات الأخيرة
    const recentLoans = await prisma.loan.findMany({
      where: { createdAt: { gte: startDate } },
      include: {
        user: { select: { name: true } },
        book: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const recentContributions = await prisma.book.findMany({
      where: {
        createdAt: { gte: startDate },
        contributorId: { not: null },
      },
      include: {
        contributor: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // دمج النشاطات
    const activities = [
      ...recentLoans.map((loan) => ({
        type: loan.status === 'RETURNED' ? 'RETURN' : 'LOAN' as const,
        date: loan.returnDate?.toISOString() || loan.createdAt.toISOString(),
        details:
          loan.status === 'RETURNED'
            ? `تم إرجاع كتاب`
            : `استعارة كتاب جديد`,
        userName: loan.user.name,
        bookTitle: loan.book.title,
      })),
      ...recentContributions.map((book) => ({
        type: 'CONTRIBUTION' as const,
        date: book.createdAt.toISOString(),
        details: `إضافة كتاب جديد للمكتبة`,
        userName: book.contributor?.name || 'مجهول',
        bookTitle: book.title,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15)

    return NextResponse.json({
      totalBooks,
      totalUsers,
      totalLoans,
      activeLoans,
      overdueLoans,
      returnedLoans,
      mostBorrowedBooks: formattedMostBorrowed,
      topContributors: formattedContributors,
      recentActivities: activities,
    })
  } catch (error) {
    console.error('Error generating reports:', error)
    return NextResponse.json(
      { error: 'Failed to generate reports' },
      { status: 500 }
    )
  }
}