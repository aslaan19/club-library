// src/app/api/books/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const book = await prisma.book.findUnique({
    where: { id },
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