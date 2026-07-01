'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreatePublicationPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', description: '', price: '', isPublished: false })
  const [coverFile, setCoverFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('price', form.price)
    formData.append('isPublished', form.isPublished ? 'true' : 'false')
    if (coverFile) formData.append('cover', coverFile)

    const res = await fetch('/api/admin/publications', { method: 'POST', body: formData })
    const data = await res.json()

    if (res.ok) {
      router.push('/publications')
    } else {
      setError(data.error || 'Failed to create publication.')
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/publications" className="text-sm text-blue-600 hover:underline">
        ← Back to Publications
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6">Create Publication</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="e.g. The Skipper"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price (€) <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">€</span>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm"
              placeholder="9.99"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            rows={3}
            placeholder="Short description of this publication..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image <span className="text-gray-400 font-normal">(optional)</span></label>
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
            checked={form.isPublished}
            onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 text-blue-600"
          />
          <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
            Publish immediately
          </label>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1C3664] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-900 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Publication'}
        </button>
      </form>
    </div>
  )
}