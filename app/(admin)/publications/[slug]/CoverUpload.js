'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function CoverUpload({ publicationId, currentCover }) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(currentCover)
  const inputRef = useRef(null)
  const router = useRouter()

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setLoading(true)

    const formData = new FormData()
    formData.append('cover', file)

    const res = await fetch(`/api/admin/publications/${publicationId}/cover`, {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      router.refresh()
    } else {
      alert('Upload failed. Try again.')
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
        {preview
          ? <img src={preview} alt="Cover" className="w-full h-full object-cover" />
          : <span className="text-2xl">📖</span>}
      </div>
      <div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Update Cover Image'}
        </button>
        <p className="text-xs text-gray-400 mt-1">JPG or PNG, shown on homepage grid</p>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>
    </div>
  )
}