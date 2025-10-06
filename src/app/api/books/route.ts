// src/app/api/books/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const books = await prisma.book.findMany({
    where: {
      ...(category && { category }),
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      contributor: {
        select: {
          name: true,
          email: true,
        },
      },
      loans: {
        where: { status: 'ACTIVE' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(books)
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies:  () => cookieStore })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, author, description, category, coverImage } = await request.json()

  const book = await prisma.book.create({
    data: {
      title,
      author,
      description,
      category,
      coverImage,
      contributorId: session.user.id,
      status: 'AVAILABLE',
    },
  })

  return NextResponse.json(book)
}