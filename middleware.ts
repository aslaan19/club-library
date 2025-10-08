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

  // Public paths (don't need login)
  const publicPaths = ['/login', '/signup']
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path))

  // If user is not logged in and trying to access protected page
  if (!session && !isPublicPath) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is logged in and trying to access login/signup
  if (session && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Get role from auth metadata (not database query)
    const userRole = session.user.user_metadata?.role

    if (userRole !== 'ADMIN') {
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