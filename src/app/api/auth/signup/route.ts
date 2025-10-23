import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { id, email, name, role } = await request.json()

    console.log('Creating user:', { id, email, name, role })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (existingUser) {
      console.log('User already exists:', existingUser)
      return NextResponse.json({ user: existingUser }, { status: 200 })
    }

    // Create user in Prisma
    const user = await prisma.user.create({
      data: {
        id,
        email,
        name,
        role: role || 'STUDENT',
      },
    })

    console.log('User created successfully:', user)
    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    console.error('Database user creation error:', error)
    console.error('Error details:', error.message, error.code)
    return NextResponse.json({ 
      error: error.message,
      code: error.code 
    }, { status: 500 })
  }
}