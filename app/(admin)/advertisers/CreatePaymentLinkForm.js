'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreatePaymentLinkForm({ publications }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    advertiserName: '',
    advertiserEmail: '',
    publicationId: publications[0]?.id || '',
    amountEuros: '',
    notes: '',
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.advertiserName || !form.publicationId || !form.amountEuros) return
    setLoading(true)
    setGeneratedUrl(null)

    const res = await fetch('/api/stripe/payment-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        amountEuros: parseFloat(form.amountEuros),
      }),
    })

    const data = await res.json()
    if (data.url) {
      setGeneratedUrl(data.url)
      setForm(prev => ({ ...prev, advertiserName: '', advertiserEmail: '', amountEuros: '', notes: '' }))
      router.refresh()
    } else {
      alert(data.error || 'Something went wrong')
    }
    setLoading(false)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Advertiser Name *</label>
        <input
          name="advertiserName"
          value={form.advertiserName}
          onChange={handleChange}
          required
          placeholder="Acme Ltd"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Advertiser Email</label>
        <input
          name="advertiserEmail"
          type="email"
          value={form.advertiserEmail}
          onChange={handleChange}
          placeholder="contact@acme.ie"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Publication *</label>
        <select
          name="publicationId"
          value={form.publicationId}
          onChange={handleChange}
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {publications.map(pub => (
            <option key={pub.id} value={pub.id}>{pub.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Deposit Amount (€) *</label>
        <input
          name="amountEuros"
          type="number"
          min="1"
          step="0.01"
          value={form.amountEuros}
          onChange={handleChange}
          required
          placeholder="500.00"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
        <input
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Full page, inside back cover"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Payment Link'}
      </button>

      {generatedUrl && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs font-semibold text-green-700 mb-2">✓ Link created! Copy and send to advertiser:</p>
          <p className="text-xs text-gray-600 break-all mb-3 font-mono bg-white p-2 rounded border border-green-100">
            {generatedUrl}
          </p>
          <button
            type="button"
            onClick={copyLink}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg transition"
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>
      )}
    </form>
  )
}