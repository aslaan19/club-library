'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

const CATEGORIES = [
  'روايات',
  'تاريخ',
  'فلسفة',
  'علوم',
  'تطوير ذات',
  'أدب',
  'سير ذاتية',
  'دين',
  'سياسة',
  'تكنولوجيا',
  'أخرى',
]

export default function AddBookPage() {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    coverImage: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('يجب تسجيل الدخول أولاً')
      }

      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'فشل في إضافة الكتاب')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/books')
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
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
            <Link href="/books" className="hover:underline">
              الكتب
            </Link>
            <Link href="/my-loans" className="hover:underline">
              استعاراتي
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ➕ إضافة كتاب جديد
            </h1>
            <p className="text-gray-600">
              ساهم في إثراء المكتبة بإضافة كتاب جديد
            </p>
            <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg mt-4">
              <p className="text-sm text-blue-800">
                💡 سيظهر اسمك كمتطوع بهذا الكتاب، ويمكنك حذفه لاحقًا إذا لم يكن مستعارًا
              </p>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-r-4 border-green-500 text-green-800 p-4 rounded mb-6">
              ✅ تم إضافة الكتاب بنجاح! جاري التحويل...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-r-4 border-red-500 text-red-800 p-4 rounded mb-6">
              ❌ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                عنوان الكتاب *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-waaeen-red focus:outline-none"
                placeholder="مثال: البداية والنهاية"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                المؤلف *
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-waaeen-red focus:outline-none"
                placeholder="مثال: ابن كثير"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                التصنيف *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-waaeen-red focus:outline-none"
              >
                <option value="">اختر التصنيف</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                وصف الكتاب
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-waaeen-red focus:outline-none"
                placeholder="وصف مختصر عن محتوى الكتاب..."
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                رابط صورة الغلاف (اختياري)
              </label>
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-waaeen-red focus:outline-none"
                placeholder="https://example.com/cover.jpg"
              />
              {formData.coverImage && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">معاينة:</p>
                  <img
                    src={formData.coverImage}
                    alt="Book cover preview"
                    className="w-32 h-48 object-cover rounded-lg border-2 border-gray-300"
                    onError={(e) => {
                      e.currentTarget.src = ''
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || success}
                className="flex-1 bg-gradient-to-l from-waaeen-red to-waaeen-red-dark text-white font-bold py-4 rounded-lg hover:from-waaeen-red-dark hover:to-waaeen-black transition-all disabled:opacity-50"
              >
                {loading ? 'جاري الإضافة...' : '➕ إضافة الكتاب'}
              </button>
              <Link
                href="/books"
                className="flex-1 bg-gray-300 text-gray-700 font-bold py-4 rounded-lg hover:bg-gray-400 transition-all text-center"
              >
                إلغاء
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}