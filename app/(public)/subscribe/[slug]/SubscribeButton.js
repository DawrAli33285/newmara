'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SubscribeButton({ publicationId, slug }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubscribe() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicationSlug: slug }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert(data.error || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: '#2F7D1B', minHeight: 44 }}
    >
      {loading ? 'Redirecting to payment...' : (
        <>
          Subscribe Now <span aria-hidden="true">→</span>
        </>
      )}
    </button>
  )
}