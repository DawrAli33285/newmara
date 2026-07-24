'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditPublicationModal({ publication, onClose }) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: publication.title || '',
    description: publication.description || '',
    price: publication.priceEuros ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch(`/api/admin/publications/${publication.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        price: form.price,
      }),
    })
    const data = await res.json()

    if (res.ok) {
      router.refresh()
      onClose()
    } else {
      setError(data.error || 'Failed to update publication.')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Edit ${publication.title}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#0B1830' }}>
              Edit Publication
            </h2>
            <p className="mt-1 text-sm" style={{ color: '#657084' }}>
              {publication.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-gray-100"
            style={{ color: '#657084' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold" style={{ color: '#0B1830' }}>
              Title <span style={{ color: '#B3261E' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2"
              style={{ borderColor: '#D9E0E7', color: '#0B1830' }}
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
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full rounded-xl border py-2.5 pl-7 pr-3.5 text-sm outline-none transition focus:ring-2"
                style={{ borderColor: '#D9E0E7', color: '#0B1830' }}
                placeholder="9.99"
              />
            </div>
            <p className="mt-1.5 text-xs" style={{ color: '#657084' }}>
              Changing the price creates a new Stripe price and archives the old one. Existing subscribers keep their current rate until renewal.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold" style={{ color: '#0B1830' }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2"
              style={{ borderColor: '#D9E0E7', color: '#0B1830' }}
              placeholder="Short description of this publication..."
            />
          </div>

          {error && (
            <p
              className="rounded-xl px-3.5 py-2.5 text-sm"
              style={{ backgroundColor: '#FBEAE9', color: '#B3261E' }}
            >
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border py-2.5 text-sm font-semibold transition hover:bg-gray-50"
              style={{ borderColor: '#D9E0E7', color: '#0B1830' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#2F7D1B' }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}