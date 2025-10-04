// app/(dashboard)/books/add/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES = ['تاريخ', 'روايات', 'دين', 'سياسة', 'تطوير ذات', 'علوم', 'فلسفة']

export default function AddBookPage() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        author,
        description,
        category,
        coverImage: coverImage || null,
      }),
    })

    if (res.ok) {
      alert('تمت إضافة الكتاب بنجاح!')
      router.push('/books')
    } else {
      const error = await res.json()
      alert(error.error || 'حدث خطأ')
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Link href="/books" className="text-blue-600 hover:underline mb-4 block">
        ← العودة للمكتبة
      </Link>

      <h1 className="text-3xl font-bold mb-6">إضافة كتاب تطوعًا</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">عنوان الكتاب *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border px-4 py-2 rounded w-full"
            placeholder="مثال: البداية والنهاية"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">المؤلف *</label>
          <input
            type="text"
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="border px-4 py-2 rounded w-full"
            placeholder="مثال: ابن كثير"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">الفئة *</label>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border px-4 py-2 rounded w-full"
          >
            <option value="">اختر فئة</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">الوصف</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border px-4 py-2 rounded w-full h-32"
            placeholder="وصف مختصر للكتاب..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">رابط الصورة (اختياري)</label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="border px-4 py-2 rounded w-full"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 disabled:bg-gray-400"
        >
          {loading ? 'جاري الإضافة...' : 'إضافة الكتاب'}
        </button>
      </form>
    </div>
  )
}