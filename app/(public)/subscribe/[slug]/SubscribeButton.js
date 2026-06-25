'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SubscribeButton({ publicationId, slug }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubscribe() {
    setLoading(true)
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicationId }),
    })
    if (res.ok) {
      router.push(`/read/${slug}`)
    } else {
      alert('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60"
    >
      {loading ? 'Processing...' : 'Subscribe Now (Test)'}
    </button>
  )
}