'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UploadIssuePage() {
  const router = useRouter()
  const [publications, setPublications] = useState([])
  const [form, setForm] = useState({ publicationId: '', issueNumber: '', title: '' })
  const [pdfFile, setPdfFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/publications').then(r => r.json()).then(setPublications)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!pdfFile) return setError('Please select a PDF file.')
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('publicationId', form.publicationId)
    formData.append('issueNumber', form.issueNumber)
    formData.append('title', form.title)
    formData.append('pdf', pdfFile)
    if (coverFile) formData.append('cover', coverFile)
    formData.append('isPublished', isPublished)

    const res = await fetch('/api/admin/issues', { method: 'POST', body: formData })
    const data = await res.json()

    if (res.ok) {
      router.push('/publications')
    } else {
      setError(data.error || 'Upload failed.')
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/publications" className="text-sm text-blue-600 hover:underline">
        ← Back to Publications
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6">Upload New Issue</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Publication</label>
          <select
            required
            value={form.publicationId}
            onChange={e => setForm({ ...form, publicationId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select a publication...</option>
            {publications.map(pub => (
              <option key={pub.id} value={pub.id}>{pub.title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Number</label>
            <input
              type="number"
              required
              min="1"
              value={form.issueNumber}
              onChange={e => setForm({ ...form, issueNumber: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. January 2025"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PDF File <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept="application/pdf"
            required
            onChange={e => setPdfFile(e.target.files[0])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cover Image <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setCoverFile(e.target.files[0])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPublished"
            checked={isPublished}
            onChange={e => setIsPublished(e.target.checked)}
            className="w-4 h-4 accent-[#1C3664]"
          />
          <label htmlFor="isPublished" className="text-sm text-gray-700">
            Publish immediately (visible to subscribers)
          </label>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1C3664] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-900 disabled:opacity-50"
        >
          {loading ? 'Uploading... please wait' : 'Upload Issue'}
        </button>
      </form>
    </div>
  )
}