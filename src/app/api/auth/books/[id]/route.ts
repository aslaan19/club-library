import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'

export async function GET_SINGLE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: {
      contributor: {
        select: { name: true },
      },
      loans: {
        where: { status: 'ACTIVE' },
        include: {
          user: {
            select: { name: true },
          },
        },
      },
    },
  })

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  return NextResponse.json(book)
}

// DELETE: حذف كتاب (المتطوع أو الأدمن فقط)
export async function DELETE_BOOK(
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

  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: {
      loans: { where: { status: 'ACTIVE' } },
    },
  })

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  // تحقق: هل الكتاب مستعار حاليًا؟
  if (book.loans.length > 0) {
    return NextResponse.json(
      { error: 'Cannot delete book that is currently borrowed' },
      { status: 400 }
    )
  }

  // تحقق: هل المستخدم هو المتطوع أو أدمن؟
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  const isOwner = book.contributorId === session.user.id
  const isAdmin = user?.role === 'ADMIN'

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.book.delete({ where: { id: params.id } })

  return NextResponse.json({ message: 'Book deleted successfully' })
}