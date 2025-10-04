'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function BooksPage() {
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      const response = await fetch('/api/books')
      const data = await response.json()
      setBooks(data)
    } catch (error) {
      console.error('Error loading books:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(search.toLowerCase()) ||
    book.author.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-l from-waaeen-red to-waaeen-black text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold hover:opacity-80">
            مكتبة وعيّن
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard" className="hover:underline">
              الرئيسية
            </Link>
            <Link href="/my-loans" className="hover:underline">
              استعاراتي
            </Link>
            <Link href="/books/add" className="hover:underline">
              إضافة كتاب
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            مكتبة الكتب 📚
          </h1>

          {/* Search */}
          <input
            type="text"
            placeholder="ابحث عن كتاب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-waaeen-red focus:outline-none"
          />
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">لا توجد كتب متاحة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
              >
                {/* Book Cover */}
                <div className="h-48 bg-gradient-to-br from-waaeen-red to-waaeen-black flex items-center justify-center">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-6xl">📖</span>
                  )}
                </div>

                {/* Book Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                  
                  {/* Status Badge */}
                  <div className="mb-3">
                    {book.status === 'AVAILABLE' ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                        متاح
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                        مستعار
                      </span>
                    )}
                  </div>

                  {/* Contributor */}
                  {book.contributor && (
                    <p className="text-xs text-gray-500 mb-3">
                      متطوع: {book.contributor.name}
                    </p>
                  )}

                  {/* Action Button */}
                  <Link
                    href={`/books/${book.id}`}
                    className="block w-full bg-waaeen-red text-white text-center py-2 rounded-lg font-bold hover:bg-waaeen-red-dark transition-all"
                  >
                    عرض التفاصيل
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}