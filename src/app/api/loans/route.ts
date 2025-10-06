// app/api/loans/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { addDays } from "date-fns"

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  try {
    const loans = await prisma.loan.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status: status as any }),
      },
      include: {
        book: true,
      },
      orderBy: { borrowDate: "desc" },
    })

    return NextResponse.json(loans)
  } catch (error) {
    console.error("Error fetching loans:", error)
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { bookId, days } = await request.json()

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        loans: { where: { status: "ACTIVE" } },
      },
    })

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    if (book.status !== "AVAILABLE" || book.loans.length > 0) {
      return NextResponse.json({ error: "Book is not available" }, { status: 400 })
    }

    if (days > 14 || days < 1) {
      return NextResponse.json(
        { error: "Loan period must be between 1 and 14 days" },
        { status: 400 }
      )
    }

    const dueDate = addDays(new Date(), days)

    const loan = await prisma.loan.create({
      data: {
        userId: session.user.id,
        bookId,
        dueDate,
        status: "ACTIVE",
      },
      include: {
        book: true,
      },
    })

    await prisma.book.update({
      where: { id: bookId },
      data: { status: "BORROWED" },
    })

    return NextResponse.json(loan)
  } catch (error) {
    console.error("Error creating loan:", error)
    return NextResponse.json({ error: "Failed to create loan" }, { status: 500 })
  }
}