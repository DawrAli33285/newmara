'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Something went wrong.')
    } else {
      setSubmitted(true)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div
        className="rounded-2xl border bg-white p-8"
        style={{ borderColor: '#D9E0E7', boxShadow: '0 20px 40px -24px rgba(8, 27, 49, 0.25)' }}
      >
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-bold transition hover:opacity-80"
            style={{ color: '#0B1830' }}
          >
            Mara Media
          </Link>
          <p className="mt-2 text-sm" style={{ color: '#657084' }}>
            Reset your password
          </p>
        </div>

        {submitted ? (
          <div className="py-4 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: '#EFF5EE' }}
            >
              <svg
                className="h-8 w-8"
                style={{ color: '#2F7D1B' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold" style={{ color: '#0B1830' }}>
              Check your email
            </h3>
            <p className="mb-6 text-sm" style={{ color: '#657084' }}>
              If an account exists for <strong>{email}</strong>, we've sent a password reset link. Check your inbox and spam folder.
            </p>
            <Link
              href="/login"
              className="text-sm font-semibold transition hover:opacity-80"
              style={{ color: '#2F7D1B' }}
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm" style={{ color: '#657084' }}>
              Enter the email address on your account and we'll send you a link to reset your password.
            </p>

            {error && (
              <div
                className="mb-5 rounded-xl border p-3 text-sm"
                style={{ backgroundColor: '#FBEAE9', borderColor: '#F3C9C6', color: '#B3261E' }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold" style={{ color: '#0B1830' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                  style={{ borderColor: '#D9E0E7', color: '#0B1830', minHeight: 44 }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#2F7D1B', minHeight: 44 }}
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <div className="my-6 h-px w-full" style={{ backgroundColor: '#D9E0E7' }} />

            <p className="text-center text-sm" style={{ color: '#657084' }}>
              Remembered it?{' '}
              <Link
                href="/login"
                className="font-semibold transition hover:opacity-80"
                style={{ color: '#2F7D1B' }}
              >
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-sm" style={{ color: '#657084' }}>
        <Link href="/" className="transition hover:opacity-80" style={{ color: '#0B1830' }}>
          ← Back to Mara Media
        </Link>
      </p>
    </div>
  )
}