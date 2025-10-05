import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

// app/api/admin/users/route.ts - إدارة المستخدمين
export async function GET() {
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

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          loans: true,
          contributions: true,
        },
      },
      loans: {
        where: { status: 'OVERDUE' },
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  }) as Array<{
    id: string
    email: string
    name: string | null
    role: string
    createdAt: Date
    _count: {
      loans: number
      contributions: number
    }
    loans: Array<{ id: string }>
  }>

  return NextResponse.json({ 
    users: users.map(({ _count: count, loans, ...user }) => ({
      ...user,
      loanCount: count.loans,
      contributionCount: count.contributions,
      overdueLoans: loans.length,
    }))
  })
}
