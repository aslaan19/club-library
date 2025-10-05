import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // cookies() is now async in Next.js 15
  const cookieStore = await cookies()

  // The createRouteHandlerClient now expects cookies as a function
  const supabase = createRouteHandlerClient({ cookies: async() => cookieStore })

  // Route params are now possibly async in the latest Next.js App Router
  const resolvedParams = await params

  // Get session from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch the loan
  const loan = await prisma.loan.findUnique({
    where: { id: resolvedParams.id },
    include: { book: true },
  })

  if (!loan) {
    return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
  }

  // Fetch user
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  const isOwner = loan.userId === session.user.id
  const isAdmin = user?.role === 'ADMIN'

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Return data
  return NextResponse.json(loan)
}
