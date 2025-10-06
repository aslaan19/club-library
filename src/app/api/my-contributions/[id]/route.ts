// src/app/api/my-contributions/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = request.headers.get('x-user-id')
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if book exists and belongs to user
  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      loans: { where: { status: 'ACTIVE' } },
    },
  })

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  if (book.contributorId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Check if currently loaned
  if (book.loans.length > 0) {
    return NextResponse.json(
      { error: 'Cannot delete book that is currently borrowed' },
      { status: 400 }
    )
  }

  // Delete the book
  await prisma.book.delete({ where: { id } })

  return NextResponse.json({ message: 'Book deleted successfully' })
}