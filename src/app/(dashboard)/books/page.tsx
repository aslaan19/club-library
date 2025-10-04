// app/(dashboard)/books/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetchBooks()
  }, [search, category])

  const fetchBooks = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (category) params.append('category', category)

    const res = await fetch(`/api/books?${params}`)
    const data = await res.json()
    setBooks(data)
    setLoading(false)
  }

  const isAvailable = (book: Book) => {
    return book.status === 'AVAILABLE' && book.loans.length === 0
  }

  return (
    <div className="container mx-auto p-8 ">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">المكتبة</h1>
        <Link
          href="/books/add"
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          إضافة كتاب تطوعًا
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="ابحث عن كتاب..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded w-full max-w-md"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border px-4 py-2 rounded"
        >
          <option value="">كل الفئات</option>
          <option value="تاريخ">تاريخ</option>
          <option value="روايات">روايات</option>
          <option value="دين">دين</option>
          <option value="سياسة">سياسة</option>
          <option value="تطوير ذات">تطوير ذات</option>
        </select>
      </div>

      {/* Books Grid */}
      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="border rounded-lg p-4 hover:shadow-lg transition"
            >
              {book.coverImage && (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              <h3 className="text-xl font-bold mb-2">{book.title}</h3>
              <p className="text-gray-600 mb-2">{book.author}</p>
              <p className="text-sm text-gray-500 mb-2">{book.category}</p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${
                    isAvailable(book) ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isAvailable(book) ? 'متاح' : 'مُستعار'}
                </span>
                {book.contributor && (
                  <span className="text-xs text-gray-400">
                    تطوع: {book.contributor.name}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}