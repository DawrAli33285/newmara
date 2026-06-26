'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CancelSubscriptionButton({ subscriptionId, stripeSubscriptionId, publicationTitle }) {
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    setLoading(true)
    const res = await fetch('/api/subscriptions/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId, stripeSubscriptionId }),
    })
    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to cancel. Please try again.')
    }
    setLoading(false)
    setConfirming(false)
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Cancel {publicationTitle}?</span>
        <button onClick={handleCancel} disabled={loading} className="text-xs text-red-400 hover:text-red-300 font-medium transition">
          {loading ? 'Cancelling...' : 'Yes, cancel'}
        </button>
        <button onClick={() => setConfirming(false)} className="text-xs text-gray-500 hover:text-gray-300 transition">Never mind</button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-gray-500 hover:text-red-400 transition"
    >
      Cancel
    </button>
  )
}