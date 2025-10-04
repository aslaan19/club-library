'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. إنشاء حساب في Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (authError) throw authError

      // 2. إنشاء User في Database عبر API
      if (authData.user) {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: authData.user.id,
            email: authData.user.email,
            name,
          }),
        })

        if (!response.ok) {
          throw new Error('فشل في إنشاء الحساب في قاعدة البيانات')
        }
      }

      alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.')
      router.push('/login')
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في إنشاء الحساب')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-waaeen-red to-waaeen-black-light flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-waaeen-black mb-2">
            إنشاء حساب جديد
          </h1>
          <p className="text-gray-600">انضم لمكتبة وعيّن</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 text-red-800 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              الاسم الكامل
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-waaeen-red focus:outline-none"
              placeholder="عبدالله أيمن"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-waaeen-red focus:outline-none"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-waaeen-red focus:outline-none"
              placeholder="••••••••"
            />
            <p className="text-sm text-gray-500 mt-1">
              الحد الأدنى 6 أحرف
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-l from-waaeen-red to-waaeen-red-dark text-white font-bold py-4 rounded-lg hover:from-waaeen-red-dark hover:to-waaeen-black transition-all disabled:opacity-50"
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            لديك حساب بالفعل؟{' '}
            <a
              href="/login"
              className="text-waaeen-red font-bold hover:underline"
            >
              تسجيل الدخول
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}