'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setSubmitted(true)
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-xl border border-[#DADADA] p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-[18px] font-medium text-[#19153F]">Reset password</h1>
        <p className="text-[13px] text-[#595959] mt-1">Task Tracker — Access Infinity</p>
      </div>

      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-md bg-[#F0FDF9] border border-[#00D1BA] px-4 py-3">
            <p className="text-[13px] text-[#19153F]">
              If an account exists for <span className="font-medium">{email}</span>, you will receive a password reset link shortly.
            </p>
          </div>
          <p className="text-[12px] text-[#595959]">
            Didn&apos;t receive it? Check your spam folder or{' '}
            <button
              onClick={() => setSubmitted(false)}
              className="text-[#38308F] hover:underline"
            >
              try again
            </button>
            .
          </p>
          <Link
            href="/login"
            className="block text-center text-[13px] text-[#38308F] hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <p className="text-[13px] text-[#595959] mb-5">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

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

            {error && <p className="text-[12px] text-[#CC0015]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-[#19153F] text-white text-[13px] font-medium rounded-md hover:bg-[#2D2870] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>

          <p className="mt-4 text-[12px] text-[#595959] text-center">
            <Link href="/login" className="text-[#38308F] hover:underline">
              Back to sign in
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
