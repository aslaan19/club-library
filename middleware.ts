// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // المسارات العامة (لا تحتاج تسجيل دخول)
  const publicPaths = ['/login', '/signup']
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path))

  // إذا المستخدم مش مسجل دخول وحاول يدخل صفحة محمية
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // إذا المستخدم مسجل دخول وحاول يدخل login/signup
  if (session && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // حماية مسارات الأدمن
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // تحقق من دور المستخدم في Database
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (user?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}