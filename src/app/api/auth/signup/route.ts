import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { id, email, name, role } = await request.json()

    // Only create user in Prisma (Auth already done in frontend)
    const user = await prisma.user.create({
      data: {
        id,
        email,
        name,
        role: role || 'STUDENT',
      },
    })

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Database user creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}