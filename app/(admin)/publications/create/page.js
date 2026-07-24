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
      <Link
        href="/publications"
        className="text-sm font-semibold transition hover:opacity-80"
        style={{ color: '#2F7D1B' }}
      >
        ← Back to Publications
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6" style={{ color: '#0B1830' }}>
        Create Publication
      </h1>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border bg-white p-6 space-y-5"
        style={{ borderColor: '#D9E0E7' }}
      >
        <div>
          <label className="mb-1.5 block text-sm font-semibold" style={{ color: '#0B1830' }}>
            Title <span style={{ color: '#B3261E' }}>*</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2"
            style={{ borderColor: '#D9E0E7', color: '#0B1830' }}
            placeholder="e.g. The Skipper"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold" style={{ color: '#0B1830' }}>
            Price (€) <span style={{ color: '#B3261E' }}>*</span>
          </label>
          <div className="relative">
            <span
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: '#657084' }}
            >
              €
            </span>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              className="w-full rounded-xl border py-2.5 pl-7 pr-3.5 text-sm outline-none transition focus:ring-2"
              style={{ borderColor: '#D9E0E7', color: '#0B1830' }}
              placeholder="9.99"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold" style={{ color: '#0B1830' }}>
            Description
          </label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2"
            style={{ borderColor: '#D9E0E7', color: '#0B1830' }}
            rows={3}
            placeholder="Short description of this publication..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold" style={{ color: '#0B1830' }}>
            Cover Image <span className="font-normal" style={{ color: '#657084' }}>(optional)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setCoverFile(e.target.files[0])}
            className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition"
            style={{ borderColor: '#D9E0E7', color: '#0B1830' }}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPublished"
            checked={form.isPublished}
            onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
            className="h-4 w-4 rounded"
            style={{ accentColor: '#2F7D1B' }}
          />
          <label htmlFor="isPublished" className="text-sm font-semibold" style={{ color: '#0B1830' }}>
            Publish immediately
          </label>
        </div>

        {error && (
          <p
            className="rounded-xl px-3.5 py-2.5 text-sm"
            style={{ backgroundColor: '#FBEAE9', color: '#B3261E' }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#2F7D1B' }}
        >
          {loading ? 'Creating...' : 'Create Publication'}
        </button>
      </form>
    </div>
  )
}