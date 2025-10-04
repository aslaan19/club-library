import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../../lib/prisma'


export async function GET_OVERDUE() {
  const today = new Date()

  const overdueLoans = await prisma.loan.findMany({
    where: {
      status: 'ACTIVE',
      dueDate: {
        lt: today,
      },
    },
    include: {
      book: true,
      user: {
        select: { name: true, email: true },
      },
    },
  })

  // تحديث حالتها إلى OVERDUE
  await prisma.loan.updateMany({
    where: {
      status: 'ACTIVE',
      dueDate: {
        lt: today,
      },
    },
    data: {
      status: 'OVERDUE',
    },
  })

  return NextResponse.json(overdueLoans)
}