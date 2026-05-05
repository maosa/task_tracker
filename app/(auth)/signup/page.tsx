'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Trigger auto-creates the users row; update it with the name and role fields
      await supabase
        .from('users')
        .update({ first_name: firstName, last_name: lastName, role: role || null })
        .eq('id', data.user.id)

      if (!data.session) {
        setConfirmMessage('Check your email to confirm your account, then sign in.')
        setLoading(false)
        return
      }

      router.push('/tasks')
    }
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-xl border border-[#DADADA] p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-[18px] font-medium text-[#19153F]">Create account</h1>
        <p className="text-[13px] text-[#595959] mt-1">Task Tracker</p>
      </div>

      {confirmMessage ? (
        <div className="space-y-4 text-center">
          <p className="text-[13px] text-[#19153F]">{confirmMessage}</p>
          <Link href="/login" className="block text-[13px] text-[#38308F] hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#595959] mb-1">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoFocus
                className="w-full h-9 px-3 text-[13px] border border-[#DADADA] rounded-md focus:outline-none focus:border-[#38308F] text-[#19153F]"
                placeholder="Andreas"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#595959] mb-1">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full h-9 px-3 text-[13px] border border-[#DADADA] rounded-md focus:outline-none focus:border-[#38308F] text-[#19153F]"
                placeholder="Maos"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#595959] mb-1">Current role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-9 px-3 text-[13px] border border-[#DADADA] rounded-md focus:outline-none focus:border-[#38308F] text-[#19153F]"
              placeholder="e.g. Product Manager"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#595959] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              minLength={6}
              className="w-full h-9 px-3 text-[13px] border border-[#DADADA] rounded-md focus:outline-none focus:border-[#38308F] text-[#19153F]"
              placeholder="At least 6 characters"
            />
          </div>

          {error && <p className="text-[12px] text-[#CC0015]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 bg-[#19153F] text-white text-[13px] font-medium rounded-md hover:bg-[#2D2870] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      )}

      {!confirmMessage && (
        <p className="mt-4 text-[12px] text-[#595959] text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-[#38308F] hover:underline">
            Sign in
          </Link>
        </p>
      )}
    </div>
  )
}
