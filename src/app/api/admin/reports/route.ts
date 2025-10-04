import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

// app/api/admin/reports/route.ts - التقارير
export async function GET_REPORTS(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (type === 'top-borrowers') {
    const topBorrowers = await prisma.user.findMany({
      where: { role: 'STUDENT' },
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
      take: 10,
    })
    return NextResponse.json(topBorrowers)
  }

  if (type === 'top-contributors') {
    const topContributors = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        _count: {
          select: { contributions: true },
        },
      },
      orderBy: {
        contributions: {
          _count: 'desc',
        },
      },
      take: 10,
    })
    return NextResponse.json(topContributors)
  }

  if (type === 'overdue-users') {
    const overdueUsers = await prisma.user.findMany({
      where: {
        loans: {
          some: { status: 'OVERDUE' },
        },
      },
      include: {
        loans: {
          where: { status: 'OVERDUE' },
          include: { book: true },
        },
      },
    })
    return NextResponse.json(overdueUsers)
  }

  return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
}