'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('default_landing')
        .eq('id', data.user.id)
        .single()

      router.push(profile?.default_landing === 'manager_view' ? '/manager' : '/tasks')
    } else {
      router.push('/tasks')
    }
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-xl border border-[#DADADA] p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-[18px] font-medium text-[#19153F]">Sign in</h1>
        <p className="text-[13px] text-[#595959] mt-1">Task Tracker — Access Infinity</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[12px] font-medium text-[#595959] mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full h-9 px-3 text-[13px] border border-[#DADADA] rounded-md focus:outline-none focus:border-[#38308F] text-[#19153F]"
            placeholder="you@accessinfinity.com"
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#595959] mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-9 px-3 text-[13px] border border-[#DADADA] rounded-md focus:outline-none focus:border-[#38308F] text-[#19153F]"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-[12px] text-[#CC0015]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-9 bg-[#19153F] text-white text-[13px] font-medium rounded-md hover:bg-[#2D2870] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 text-[12px] text-[#595959] text-center">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#38308F] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
