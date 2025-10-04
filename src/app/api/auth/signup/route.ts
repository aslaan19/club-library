// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const { id, email, name } = await request.json()

  try {
    await prisma.user.create({
      data: {
        id,
        email,
        name,
        role: 'STUDENT',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}