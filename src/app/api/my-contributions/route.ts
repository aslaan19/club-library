// src/app/api/my-contributions/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id')
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const books = await prisma.book.findMany({
    where: {
      contributorId: userId,
    },
    include: {
      loans: {
        where: { status: 'ACTIVE' },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
      _count: {
        select: {
          loans: true, // Total times borrowed
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(books)
}