'use client'

import { useState, useEffect, useCallback } from 'react'

const PRINT_ENTITLEMENT_FIELDS = [
  { key: 'video', label: 'Video' },
  { key: 'link', label: 'Link' },
]

function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-semibold text-white transition-all
            ${t.type === 'success' ? 'bg-[#527322]' : ''}
            ${t.type === 'error' ? 'bg-red-600' : ''}
          `}
        >
          <span>{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="ml-1 opacity-70 hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

function useToast() {
  const [toasts, setToasts] = useState([])
  function addToast(message, type = 'success') {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 3500)
  }
  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }
  return { toasts, addToast, removeToast }
}

export default function PrintPackagesPage() {
  const [printPackages, setPrintPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState(emptyForm())
  const { toasts, addToast, removeToast } = useToast()

  function emptyForm() {
    return {
      name: '',
      description: '',
      priceCents: '',
      discountedPriceCents: '',
      isActive: true,
      entitlements: {},
    }
  }

  const loadPackages = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/print-packages')
    const data = await res.json()
    if (res.ok) setPrintPackages(data.printPackages || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadPackages()
  }, [loadPackages])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function toggleEntitlement(key) {
    setForm((current) => ({
      ...current,
      entitlements: { ...current.entitlements, [key]: !current.entitlements[key] },
    }))
  }

  function openCreateForm() {
    setEditingId(null)
    setForm(emptyForm())
    setError('')
    setShowForm(true)
  }

  function openEditForm(packageItem) {
    setEditingId(packageItem.id)
    setForm({
      name: packageItem.name,
      description: packageItem.description || '',
      priceCents: packageItem.priceCents ?? '',
      discountedPriceCents: packageItem.discountedPriceCents ?? '',
      isActive: packageItem.isActive,
      entitlements: { ...(packageItem.entitlements || {}) },
    })
    setError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm())
    setError('')
  }

  async function savePackage(event) {
    event.preventDefault()

    if (form.priceCents !== '' && form.priceCents <= 0) {
      setError('Price must be greater than 0.')
      addToast('Price must be greater than 0.', 'error')
      return
    }

    if (
      form.discountedPriceCents !== '' &&
      form.priceCents !== '' &&
      form.discountedPriceCents >= form.priceCents
    ) {
      setError('Discounted price must be less than the standard price.')
      addToast('Discounted price must be less than the standard price.', 'error')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      name: form.name,
      description: form.description || null,
      priceCents: form.priceCents === '' ? null : parseInt(form.priceCents, 10),
      discountedPriceCents:
        form.discountedPriceCents === '' ? null : parseInt(form.discountedPriceCents, 10),
      isActive: form.isActive,
      entitlements: { ...form.entitlements },
    }

    const url = editingId
      ? `/api/admin/print-packages/${editingId}`
      : '/api/admin/print-packages'

    const res = await fetch(url, {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error || 'Something went wrong.')
      addToast(data.error || 'Something went wrong.', 'error')
      return
    }

    addToast(editingId ? `"${form.name}" updated` : `"${form.name}" created`, 'success')
    closeForm()
    loadPackages()
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return
    setDeleting(true)

    const res = await fetch(`/api/admin/print-packages/${confirmDeleteId}`, {
      method: 'DELETE',
    })
    const data = await res.json()
    setDeleting(false)

    if (!res.ok) {
      addToast(data.error || 'Could not delete package.', 'error')
      setConfirmDeleteId(null)
      return
    }

    addToast('Package deleted', 'success')
    setConfirmDeleteId(null)
    loadPackages()
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#668b2f]">
              Commercial setup
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#0b1830]">
              Print packages
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              Configure print advertising packages, pricing and entitlements.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-[#668b2f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#527322]"
          >
            + Create package
          </button>
        </div>

        {loading ? (
          <div className="grid place-items-center py-20">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : printPackages.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="text-sm text-gray-400">No print packages yet.</p>
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-4 rounded-lg bg-[#668b2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#527322]"
            >
              Create your first package
            </button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {printPackages.map((packageItem) => (
              <div
                key={packageItem.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex items-start justify-between">
                  <h2 className="text-xl font-bold text-[#0b1830]">
                    {packageItem.name}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      packageItem.isActive
                        ? 'bg-[#e7f4df] text-[#4b7a28]'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {packageItem.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mb-5 rounded-xl bg-[#f7f8fa] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Price</p>
                  {packageItem.discountedPriceCents != null ? (
                    <div className="mt-1 flex items-baseline gap-2">
                      <p className="text-xl font-bold text-[#527322]">
                        €{(packageItem.discountedPriceCents / 100).toFixed(2)}
                      </p>
                      {packageItem.priceCents != null && (
                        <p className="text-sm font-medium text-gray-400 line-through">
                          €{(packageItem.priceCents / 100).toFixed(2)}
                        </p>
                      )}
                      <span className="rounded-full bg-[#edf5df] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#527322]">
                        Discounted
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 text-xl font-bold text-[#0b1830]">
                      {packageItem.priceCents != null
                        ? `€${(packageItem.priceCents / 100).toFixed(2)}`
                        : 'To be confirmed'}
                    </p>
                  )}
                </div>

                <p className="mb-5 min-h-[48px] text-sm leading-6 text-gray-500">
                  {packageItem.description || 'No description added.'}
                </p>

                <div className="mb-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                    Entitlements
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PRINT_ENTITLEMENT_FIELDS.filter(
                      (f) => packageItem.entitlements?.[f.key]
                    ).map((f) => (
                      <span
                        key={f.key}
                        className="rounded-full bg-[#edf5df] px-2.5 py-1 text-[11px] font-semibold text-[#527322]"
                      >
                        {f.label}
                      </span>
                    ))}
                    {PRINT_ENTITLEMENT_FIELDS.filter(
                      (f) => packageItem.entitlements?.[f.key]
                    ).length === 0 && (
                      <span className="text-xs text-gray-400">No entitlements enabled.</span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    {packageItem._count?.bookings ?? 0} booking(s) using this package
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(packageItem)}
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#0b1830] hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(packageItem.id)}
                    className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0b1830]/50 p-4">
            <div className="mx-auto my-8 max-w-2xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <h2 className="text-xl font-bold text-[#0b1830]">
                  {editingId ? 'Edit package' : 'Create package'}
                </h2>
                <button
                  type="button"
                  onClick={closeForm}
                  className="text-2xl text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <form onSubmit={savePackage} className="space-y-6 p-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0b1830]">
                    Package name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="e.g. Half Page, Full Page"
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#668b2f]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0b1830]">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#668b2f]"
                    placeholder="Describe this print package"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0b1830]">
                      Price (€)
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.priceCents === '' ? '' : form.priceCents / 100}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '') {
                          updateField('priceCents', '')
                          return
                        }
                        const euros = parseFloat(value)
                        if (Number.isNaN(euros) || euros <= 0) {
                          updateField('priceCents', '')
                          return
                        }
                        updateField('priceCents', Math.round(euros * 100))
                      }}
                      placeholder="e.g. 499.00"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#668b2f]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0b1830]">
                      Status
                    </label>
                    <select
                      value={form.isActive ? 'Active' : 'Inactive'}
                      onChange={(e) => updateField('isActive', e.target.value === 'Active')}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#668b2f]"
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-xl border border-[#dfe9cf] bg-[#f6faef] p-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-[#0b1830]">
                      Discounted price (€)
                    </label>
                    {form.discountedPriceCents !== '' && (
                      <button
                        type="button"
                        onClick={() => updateField('discountedPriceCents', '')}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="mt-1 mb-3 text-xs leading-5 text-gray-500">
                    Optional. Use this for negotiated deals or promotional pricing.
                  </p>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.discountedPriceCents === '' ? '' : form.discountedPriceCents / 100}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '') {
                        updateField('discountedPriceCents', '')
                        return
                      }
                      const euros = parseFloat(value)
                      if (Number.isNaN(euros) || euros <= 0) {
                        updateField('discountedPriceCents', '')
                        return
                      }
                      updateField('discountedPriceCents', Math.round(euros * 100))
                    }}
                    placeholder="e.g. 399.00"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#668b2f]"
                  />
                  {form.discountedPriceCents !== '' &&
                    form.priceCents !== '' &&
                    Number(form.discountedPriceCents) >= Number(form.priceCents) && (
                      <p className="mt-2 text-xs font-semibold text-red-600">
                        Discounted price should be less than the standard price.
                      </p>
                    )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0b1830]">
                    Entitlements
                  </label>
                  <div className="grid gap-2 rounded-xl border border-gray-200 bg-[#fafbfc] p-4 sm:grid-cols-2">
                    {PRINT_ENTITLEMENT_FIELDS.map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center gap-3 rounded-lg bg-white px-3 py-2.5 text-sm text-gray-600 hover:bg-[#edf5df]"
                      >
                        <input
                          type="checkbox"
                          checked={!!form.entitlements[key]}
                          onChange={() => toggleEntitlement(key)}
                          className="h-4 w-4 accent-[#668b2f]"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
                )}

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-[#668b2f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#527322] disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create package'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1830]/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-bold text-[#0b1830]">Delete this package?</h3>
              <p className="mt-2 text-sm text-gray-500">
                This can't be undone. If bookings are using this package, deletion will be blocked.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={deleting}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </main>
  )
}