import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()
    
    console.log('📝 Signup request:', { email, name })
    
    const supabase = createRouteHandlerClient({ cookies })

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'STUDENT',
        },
      },
    })

    if (authError) {
      console.error('❌ Supabase error:', authError)
      throw authError
    }

    if (!authData.user) {
      throw new Error('فشل في إنشاء المستخدم في Supabase')
    }

    console.log('✅ Supabase user created:', authData.user.id)

    // Create user in Prisma database
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email: authData.user.email!,
        name,
        role: 'STUDENT',
      },
    })

    console.log('✅ Database user created:', user.id)

    return NextResponse.json({ 
      success: true,
      user 
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('❌ Signup error:', error)
    return NextResponse.json({ 
      error: error.message || 'حدث خطأ في إنشاء الحساب'
    }, { status: 400 })
  }
}