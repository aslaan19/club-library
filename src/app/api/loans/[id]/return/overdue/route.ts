// app/api/loans/overdue/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date()

  const overdueLoans = await prisma.loan.findMany({
    where: {
      status: "ACTIVE",
      dueDate: {
        lt: today,
      },
    },
    include: {
      book: true,
      user: {
        select: { name: true, email: true },
      },
    },
  })

  await prisma.loan.updateMany({
    where: {
      status: "ACTIVE",
      dueDate: {
        lt: today,
      },
    },
    data: {
      status: "OVERDUE",
    },
  })

  return NextResponse.json(overdueLoans)
}