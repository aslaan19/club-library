// src/app/api/admin/stats/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Basic stats
    const [
      totalBooks,
      totalUsers,
      activeLoans,
      overdueLoans,
      totalContributions,
    ] = await Promise.all([
      prisma.book.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.loan.count({ where: { status: 'ACTIVE' } }),
      prisma.loan.count({ where: { status: 'OVERDUE' } }),
      prisma.book.count({ where: { contributorId: { not: null } } }),
    ])

    // Most borrowed books (top 5)
    const mostBorrowedBooks = await prisma.book.findMany({
      include: {
        _count: {
          select: { loans: true },
        },
      },
      orderBy: {
        loans: { _count: 'desc' },
      },
      take: 5,
    })

    // Top contributors (students who added most books)
    const topContributors = await prisma.user.findMany({
      where: {
        contributions: { some: {} },
      },
      include: {
        _count: {
          select: { contributions: true },
        },
      },
      orderBy: {
        contributions: { _count: 'desc' },
      },
      take: 5,
    })

    // Recent activity (last 10 loans)
    const recentLoans = await prisma.loan.findMany({
      include: {
        user: { select: { name: true, email: true } },
        book: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      stats: {
        totalBooks,
        totalUsers,
        activeLoans,
        overdueLoans,
        totalContributions,
      },
      mostBorrowedBooks: mostBorrowedBooks.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        borrowCount: book._count.loans,
      })),
      topContributors: topContributors.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        contributionCount: user._count.contributions,
      })),
      recentActivity: recentLoans.map((loan) => ({
        id: loan.id,
        type: loan.status === 'RETURNED' ? 'return' : 'borrow',
        userName: loan.user.name,
        bookTitle: loan.book.title,
        date: loan.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}