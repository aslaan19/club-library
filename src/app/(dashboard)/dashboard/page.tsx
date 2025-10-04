'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [activeLoans, setActiveLoans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // جلب بيانات المستخدم
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)

      // جلب الاستعارات النشطة
      const response = await fetch('/api/loans?status=ACTIVE')
      const loans = await response.json()
      setActiveLoans(loans)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

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
          <h1 className="text-2xl font-bold">مكتبة وعيّن</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-waaeen-red px-4 py-2 rounded-lg font-bold hover:bg-gray-100"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            مرحبًا، {user?.user_metadata?.name || 'طالب'}! 👋
          </h2>
          <p className="text-gray-600">
            لوحة التحكم الخاصة بك
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-waaeen-red">
            <h3 className="text-gray-600 text-sm font-bold mb-2">
              الاستعارات النشطة
            </h3>
            <p className="text-4xl font-bold text-waaeen-red">
              {activeLoans.length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-blue-500">
            <h3 className="text-gray-600 text-sm font-bold mb-2">
              الكتب المتأخرة
            </h3>
            <p className="text-4xl font-bold text-blue-600">
              {activeLoans.filter(l => new Date(l.dueDate) < new Date()).length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-bold mb-2">
              إجمالي الاستعارات
            </h3>
            <p className="text-4xl font-bold text-green-600">
              {activeLoans.length}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <a
            href="/books"
            className="bg-waaeen-red text-white p-6 rounded-xl shadow-lg hover:bg-waaeen-red-dark transition-all text-center font-bold"
          >
            📚 تصفح الكتب
          </a>
          <a
            href="/my-loans"
            className="bg-waaeen-black text-white p-6 rounded-xl shadow-lg hover:bg-waaeen-black-light transition-all text-center font-bold"
          >
            📖 استعاراتي
          </a>
          <a
            href="/books/add"
            className="bg-green-600 text-white p-6 rounded-xl shadow-lg hover:bg-green-700 transition-all text-center font-bold"
          >
            ➕ إضافة كتاب
          </a>
          <a
            href="/my-contributions"
            className="bg-blue-600 text-white p-6 rounded-xl shadow-lg hover:bg-blue-700 transition-all text-center font-bold"
          >
            🎁 مساهماتي
          </a>
        </div>

        {/* Active Loans */}
        {activeLoans.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              الاستعارات النشطة
            </h3>
            <div className="space-y-4">
              {activeLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="border-r-4 border-waaeen-red bg-gray-50 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-lg">{loan.book.title}</h4>
                      <p className="text-sm text-gray-600">{loan.book.author}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        تاريخ الإرجاع: {new Date(loan.dueDate).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <div className="text-left">
                      {new Date(loan.dueDate) < new Date() ? (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                          متأخر
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                          نشط
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}