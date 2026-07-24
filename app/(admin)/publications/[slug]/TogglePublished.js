'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function TogglePublished({ issueId, isPublished }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    console.log(issueId)
    setLoading(true)
    await fetch(`/api/admin/issues/${issueId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !isPublished }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
        isPublished
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-green-50 text-green-600 hover:bg-green-100'
      }`}
    >
      {loading ? '...' : isPublished ? 'Unpublish' : 'Publish'}
    </button>
  )
}