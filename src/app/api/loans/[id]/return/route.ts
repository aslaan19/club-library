// app/api/loans/[id]/return/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const loan = await prisma.loan.findUnique({
    where: { id: resolvedParams.id },
    include: { book: true },
  })

  if (!loan) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  const isOwner = loan.userId === session.user.id
  const isAdmin = user?.role === "ADMIN"

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const updatedLoan = await prisma.loan.update({
    where: { id: resolvedParams.id },
    data: {
      status: "RETURNED",
      returnDate: new Date(),
    },
    include: {
      book: true,
    },
  })

  await prisma.book.update({
    where: { id: loan.bookId },
    data: { status: "AVAILABLE" },
  })

  return NextResponse.json(updatedLoan)
}