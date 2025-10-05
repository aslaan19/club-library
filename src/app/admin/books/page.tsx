"use client"

import { useEffect, useState } from "react"
import type { Book } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Edit, Trash2, BookOpen, Filter, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("/api/books")
        if (!response.ok) throw new Error("Failed to fetch books")
        const data = await response.json()
        setBooks(data)
        setFilteredBooks(data)
      } catch (error) {
        console.error("Failed to fetch books:", error)
        alert("فشل في تحميل الكتب")
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  // Filter books based on search and status
  useEffect(() => {
    let filtered = books

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((book) => book.status === statusFilter)
    }

    setFilteredBooks(filtered)
  }, [searchQuery, statusFilter, books])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف الكتاب "${title}"؟`)) return

    try {
      const response = await fetch(`/api/admin/books/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete book")

      setBooks(books.filter((book) => book.id !== id))
      alert("تم حذف الكتاب بنجاح")
    } catch (error) {
      console.error("Failed to delete book:", error)
      alert("فشل في حذف الكتاب. حاول مرة أخرى")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة الكتب</h1>
          <p className="text-muted-foreground mt-1">
            {filteredBooks.length} من {books.length} كتاب
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/books/add">
            <Plus className="h-4 w-4" />
            إضافة كتاب جديد
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن كتاب أو مؤلف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">جميع الحالات</SelectItem>
                <SelectItem value="AVAILABLE">متاح</SelectItem>
                <SelectItem value="BORROWED">مستعار</SelectItem>
                <SelectItem value="MAINTENANCE">صيانة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">لا توجد كتب</CardTitle>
            <CardDescription className="text-center mb-6">
              {searchQuery || statusFilter !== "ALL"
                ? "لم يتم العثور على كتب تطابق البحث"
                : "ابدأ بإضافة كتب إلى المكتبة"}
            </CardDescription>
            {!searchQuery && statusFilter === "ALL" && (
              <Button asChild>
                <Link href="/admin/books/add">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة كتاب
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2 mb-2">{book.title}</CardTitle>
                    <CardDescription className="line-clamp-1">{book.author}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/books/${book.id}`} className="cursor-pointer">
                          <Edit className="h-4 w-4 ml-2" />
                          تعديل
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(book.id, book.title)}
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">التصنيف:</span>
                    <span className="font-medium">{book.category}</span>
                  </div>
                  {book.description && (
                    <div className="pt-2">
                      <p className="text-muted-foreground text-xs line-clamp-2">{book.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Badge
                    variant={book.status === "AVAILABLE" ? "default" : "secondary"}
                    className={
                      book.status === "AVAILABLE"
                        ? "bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20"
                        : book.status === "BORROWED"
                        ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                        : "bg-gray-500/10 text-gray-700 border-gray-500/20"
                    }
                  >
                    {book.status === "AVAILABLE" ? "متاح" : book.status === "BORROWED" ? "مستعار" : "صيانة"}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/books/${book.id}`}>عرض التفاصيل</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}