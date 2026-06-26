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
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Redirecting to payment...' : 'Subscribe Now'}
    </button>
  )
}