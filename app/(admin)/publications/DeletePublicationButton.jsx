'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeletePublicationButton({ id, title }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${title}"? This will also remove all its issues and subscriptions. This cannot be undone.`
    )
    if (!confirmed) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/publications/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to delete publication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="mt-2 w-full text-center bg-red-50 text-red-600 text-sm py-2 rounded-lg hover:bg-red-100 disabled:opacity-50"
    >
      {loading ? 'Deleting...' : 'Delete Publication'}
    </button>
  )
}