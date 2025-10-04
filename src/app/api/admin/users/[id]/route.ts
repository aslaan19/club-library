import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'

// app/api/admin/users/[id]/route.ts - تفاصيل طالب
export async function GET_USER_DETAILS(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (currentUser?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      loans: {
        include: { book: true },
        orderBy: { borrowDate: 'desc' },
      },
      contributions: {
        include: {
          _count: {
            select: { loans: true },
          },
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}