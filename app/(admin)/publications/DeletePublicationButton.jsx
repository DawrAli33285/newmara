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
        className="mt-2 w-full text-center bg-red-50 text-red-600 text-sm py-2 rounded-lg hover:bg-red-100 disabled:opacity-50"
      >
        {loading ? 'Deleting...' : 'Delete Publication'}
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !loading && setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">Delete publication?</h3>
            <p className="text-sm text-gray-500 mt-2">
              Delete "{title}"? This will also remove all its issues and subscriptions. This cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                No, cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
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