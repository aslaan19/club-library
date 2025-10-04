// app/api/loans/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { addDays, differenceInDays } from 'date-fns'

// GET: جلب استعارات المستخدم
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const loans = await prisma.loan.findMany({
    where: {
      userId: session.user.id,
      ...(status && { status: status as any }),
    },
    include: {
      book: true,
    },
    orderBy: { borrowDate: 'desc' },
  })

  return NextResponse.json(loans)
}

// POST: استعارة كتاب جديد
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bookId, dueDate } = await request.json()

  // تحقق من الكتاب
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      loans: { where: { status: 'ACTIVE' } },
    },
  })

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  if (book.status !== 'AVAILABLE') {
    return NextResponse.json({ error: 'Book is not available' }, { status: 400 })
  }

  if (book.loans.length > 0) {
    return NextResponse.json({ error: 'Book is already borrowed' }, { status: 400 })
  }

  // تحقق من حد 14 يوم
  const dueDateObj = new Date(dueDate)
  const today = new Date()
  const daysDiff = differenceInDays(dueDateObj, today)

  if (daysDiff > 14) {
    return NextResponse.json(
      { error: 'Maximum loan period is 14 days' },
      { status: 400 }
    )
  }

  if (daysDiff < 1) {
    return NextResponse.json(
      { error: 'Due date must be in the future' },
      { status: 400 }
    )
  }

  // إنشاء الاستعارة
  const loan = await prisma.loan.create({
    data: {
      userId: session.user.id,
      bookId,
      dueDate: dueDateObj,
      status: 'ACTIVE',
    },
    include: {
      book: true,
    },
  })

  // تحديث حالة الكتاب
  await prisma.book.update({
    where: { id: bookId },
    data: { status: 'BORROWED' },
  })

  return NextResponse.json(loan)
}



// app/api/loans/overdue/route.ts - جلب الاستعارات المتأخرة
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