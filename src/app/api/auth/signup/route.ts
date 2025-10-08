import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { email, password, name } = await request.json()
  
const supabase = createRouteHandlerClient({ cookies })

  try {
    // Create user in Supabase Auth with role in metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'STUDENT', // Store role in auth metadata
        },
      },
    })

    if (authError) throw authError

    // Create user in Prisma database
    if (authData.user) {
      await prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email!,
          name,
          role: 'STUDENT',
        },
      })
    }

    return NextResponse.json({ user: authData.user })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}