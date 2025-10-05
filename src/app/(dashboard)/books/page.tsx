"use client"

import { SetStateAction, useEffect, useState } from "react"
import { BookCard } from "@/components/book-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Book {
  id: string
  title: string
  author: string
  description: string | null
  category: string
  coverImage: string | null
  status: string
  contributor: { name: string; email: string } | null
  loans: any[]
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all") // Updated default value to "all"

  useEffect(() => {
    fetchBooks()
  }, [search, category])

  const fetchBooks = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (category !== "all") params.append("category", category) // Updated condition to exclude "all"

    const res = await fetch(`/api/books?${params}`)
    const data = await res.json()
    setBooks(data)
    setLoading(false)
  }

  const isAvailable = (book: Book) => {
    return book.status === "AVAILABLE" && book.loans.length === 0
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-4">
              <div className="relative w-32 h-12">
                <Image src="/image.png" alt="مكتبة وعيّن" fill className="object-contain" />
              </div>
            </Link>
            <Link href="/books/add">
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة كتاب تطوعًا
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">المكتبة</h1>
          <p className="text-muted-foreground text-lg">استكشف مجموعتنا من الكتب</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن كتاب أو مؤلف..."
              value={search}
              onChange={(e: { target: { value: SetStateAction<string> } }) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="ml-2 h-4 w-4" />
              <SelectValue placeholder="كل الفئات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفئات</SelectItem> // Updated value to "all"
              <SelectItem value="تاريخ">تاريخ</SelectItem>
              <SelectItem value="روايات">روايات</SelectItem>
              <SelectItem value="دين">دين</SelectItem>
              <SelectItem value="سياسة">سياسة</SelectItem>
              <SelectItem value="تطوير ذات">تطوير ذات</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="text-xl font-bold text-muted-foreground">جاري التحميل...</div>
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                category={book.category}
                coverImage={book.coverImage}
                isAvailable={isAvailable(book)}
                contributorName={book.contributor?.name}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">لم يتم العثور على كتب</p>
          </div>
        )}
      </div>
    </div>
  )
}
