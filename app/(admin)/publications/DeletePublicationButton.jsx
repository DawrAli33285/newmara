'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeletePublicationButton({ id, title }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/publications/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setShowConfirm(false)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to delete publication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="mt-2 w-full rounded-lg py-2 text-center text-sm font-medium transition disabled:opacity-50"
        style={{ backgroundColor: '#FBEAE9', color: '#B3261E' }}
      >
        {loading ? 'Deleting...' : 'Delete Publication'}
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Delete ${title}`}
          onClick={() => !loading && setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold" style={{ color: '#0B1830' }}>
              Delete publication?
            </h3>
            <p className="mt-2 text-sm" style={{ color: '#657084' }}>
              Delete "{title}"? This will also remove all its issues and subscriptions. This cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 rounded-xl border py-2.5 text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-50"
                style={{ borderColor: '#D9E0E7', color: '#0B1830' }}
              >
                No, cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#B3261E' }}
              >
                {loading ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}