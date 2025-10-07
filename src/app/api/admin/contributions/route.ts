// app/api/admin/contributions/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Get all books that have contributors (not null)
    const books = await prisma.book.findMany({
      where: {
        contributorId: {
          not: null,
        },
      },
      include: {
        contributor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to match the frontend expected format
    const contributions = books.map((book) => ({
      id: book.id,
      status: "APPROVED", // All books in the system are considered approved
      note: null,
      createdAt: book.createdAt.toISOString(),
      user: {
        name: book.contributor?.name || "مجهول",
        email: book.contributor?.email || "",
      },
      book: {
        title: book.title,
        author: book.author,
        category: book.category,
      },
    }));

    return NextResponse.json({ contributions });
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributions" },
      { status: 500 }
    );
  }
}