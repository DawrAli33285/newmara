'use client'

import { useState, useEffect, useCallback } from 'react'

const DIGITAL_PARTNER_ENTITLEMENT_FIELDS = [
  { key: 'logoUrl', label: 'Business logo' },
  { key: 'description', label: 'Business description' },
  { key: 'location', label: 'Location' },
  { key: 'telephone', label: 'Telephone' },
  { key: 'website', label: 'Website' },
  { key: 'mapUrl', label: 'Map and directions' },
  { key: 'socialLinks', label: 'Social media links' },
  { key: 'galleryUrls', label: 'Photo gallery' },
  { key: 'promoVideoUrl', label: 'Promotional video' },
  { key: 'ctaText', label: 'Call-to-action text' },
  { key: 'ctaUrl', label: 'Call-to-action link' },
]

const DIRECTORY_LISTING_ENTITLEMENT_FIELDS = [
  { key: 'clickablePhone', label: 'Clickable phone number' },
  { key: 'clickableEmail', label: 'Clickable email' },
  { key: 'clickableWebsite', label: 'Clickable website' },
]

const PACKAGE_TYPES = [
  { value: 'digital_partner', label: 'Digital Partner' },
  { value: 'directory_listing', label: 'Directory Listing' },
]


const BILLING_INTERVALS = ['monthly', 'annual']

function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-semibold text-white transition-all
            ${t.type === "success" ? "bg-[#527322]" : ""}
            ${t.type === "error"   ? "bg-red-600"   : ""}
            ${t.type === "info"    ? "bg-[#0b1830]" : ""}
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
  function addToast(message, type = "success") {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 3500)
  }
  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }
  return { toasts, addToast, removeToast }
}

export default function DigitalPackagesPage() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState(emptyForm())
  const { toasts, addToast, removeToast } = useToast()

  function emptyForm() {
    return {
      name: '',
      description: '',
      priceCents: '',
      discountedPriceCents: '',
      billingInterval: 'monthly',
      isActive: false,
      packageType: 'digital_partner',
      entitlements: {},
      galleryLimit: 0,
    }
  }



  const loadPackages = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/digital-packages')
    const data = await res.json()
    if (res.ok) setPackages(data.digitalPackages || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadPackages()
  }, [loadPackages])

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function toggleEntitlement(key) {
    setForm((current) => ({
      ...current,
      entitlements: {
        ...current.entitlements,
        [key]: !current.entitlements[key],
      },
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
      billingInterval: packageItem.billingInterval || 'monthly',
      isActive: packageItem.isActive,
      packageType: packageItem.packageType || 'digital_partner',
      entitlements: { ...(packageItem.entitlements || {}) },
      galleryLimit: packageItem.entitlements?.galleryLimit || 0,
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
      billingInterval: form.billingInterval || null,
      isActive: form.isActive,
      packageType: form.packageType,
      entitlements:
        form.packageType === 'directory_listing'
          ? { ...form.entitlements }
          : {
              ...form.entitlements,
              galleryLimit: Math.max(0, parseInt(form.galleryLimit, 10) || 0),
            },
    }


    

    const url = editingId
      ? `/api/admin/digital-packages/${editingId}`
      : '/api/admin/digital-packages'

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

  const totalEnabledFeatures = packages.reduce(
    (sum, p) => sum + Object.values(p.entitlements || {}).filter((v) => v === true).length,
    0
  )

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#668b2f]">
              Commercial setup
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#0b1830]">
              Digital Partner packages
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              Configure Digital Partner packages and entitlements. Final
              pricing and package entitlements remain configurable until
              confirmed by Mara Media.
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

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Total packages" value={packages.length} />
          <SummaryCard
            label="Active packages"
            value={packages.filter((item) => item.isActive).length}
          />
          <SummaryCard label="Enabled features (all packages)" value={totalEnabledFeatures} />
        </div>

        {loading ? (
          <div className="grid place-items-center py-20">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="text-sm text-gray-400">No digital packages yet.</p>
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
            {packages.map((packageItem) => (
              <div
                key={packageItem.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#668b2f]">
  {packageItem.packageType === 'directory_listing' ? 'Directory Listing' : 'Digital Partner'}
</p>

                    <h2 className="mt-2 text-xl font-bold text-[#0b1830]">
                      {packageItem.name || 'Unnamed package'}
                    </h2>
                  </div>

                  <StatusBadge status={packageItem.isActive ? 'Active' : 'Inactive'} />
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

                  <p className="mt-1 text-xs text-gray-500">
                    {packageItem.billingInterval || 'Billing period not set'}
                  </p>
                </div>

                <p className="mb-5 min-h-[48px] text-sm leading-6 text-gray-500">
                  {packageItem.description || 'No description added.'}
                </p>

                <div className="mb-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                    Entitlements
                  </p>

                  <p className="text-sm text-gray-600">
                    {Object.values(packageItem.entitlements || {}).filter((v) => v === true).length} enabled features
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {packageItem._count?.digitalPartners ?? 0} partner(s) on this package
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openEditForm(packageItem)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#0b1830] hover:bg-gray-50"
                >
                  Edit package
                </button>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0b1830]/50 p-4">
            <div className="mx-auto my-8 max-w-4xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#668b2f]">
                    Digital Partner package
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#0b1830]">
                    {editingId ? 'Edit package' : 'Create package'}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  className="text-2xl text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <form onSubmit={savePackage} className="space-y-6 p-6">
              <Input
  label="Package name"
  value={form.name}
  onChange={(value) => updateField('name', value)}
  placeholder="Essential, Enhanced or Premier"
  required
/>

<div>
  <label className="mb-2 block text-sm font-semibold text-[#0b1830]">
    Package type
  </label>
  <div className="grid grid-cols-2 gap-3">
    {PACKAGE_TYPES.map((type) => (
      <button
        key={type.value}
        type="button"
        onClick={() => updateField('packageType', type.value)}
        className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition
          ${form.packageType === type.value
            ? 'border-[#668b2f] bg-[#edf5df] text-[#4b672c]'
            : 'border-gray-200 text-gray-600 hover:border-[#668b2f]/40'}`}
      >
        {type.label}
      </button>
    ))}
  </div>
</div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0b1830]">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#668b2f]"
                    placeholder="Describe this Digital Partner package"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                <Input
                    label="Price (€)"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.priceCents === '' ? '' : form.priceCents / 100}
                    onChange={(value) => {
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
                    placeholder="e.g. 49.00"
                  />

                  <Select
                    label="Billing interval"
                    value={form.billingInterval}
                    onChange={(value) => updateField('billingInterval', value)}
                    options={BILLING_INTERVALS}
                  />

                  <Select
                    label="Status"
                    value={form.isActive ? 'Active' : 'Inactive'}
                    onChange={(value) => updateField('isActive', value === 'Active')}
                    options={['Active', 'Inactive']}
                  />
                </div>

                <div className="rounded-xl border border-[#dfe9cf] bg-[#f6faef] p-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-[#0b1830]">
                      Custom / discounted price (€)
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
                    Optional. When set, this is the price actually charged instead
                    of the standard price above — used for negotiated deals,
                    promos, or early-adopter discounts.
                  </p>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.discountedPriceCents === '' ? '' : form.discountedPriceCents / 100}
                    onChange={(event) => {
                      const value = event.target.value
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
                    placeholder="e.g. 35.00"
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
    Configurable entitlements
  </label>

  <div className="grid gap-2 rounded-xl border border-gray-200 bg-[#fafbfc] p-4 sm:grid-cols-2">
    {(form.packageType === 'directory_listing'
      ? DIRECTORY_LISTING_ENTITLEMENT_FIELDS
      : DIGITAL_PARTNER_ENTITLEMENT_FIELDS
    ).map(({ key, label }) => (
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

{form.packageType === 'digital_partner' && (
  <Input
    label="Gallery photo limit"
    type="number"
    min="0"
    value={form.galleryLimit}
    onChange={(value) => {
      const n = parseInt(value, 10)
      setForm((f) => ({
        ...f,
        galleryLimit: value === '' ? '' : Number.isNaN(n) || n < 0 ? 0 : n,
      }))
    }}
    placeholder="e.g. 10"
  />
)}

{error && (
  <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
)}

{form.packageType === 'digital_partner' && (
  <div className="rounded-xl border border-[#dfe9cf] bg-[#f6faef] p-4 text-sm text-[#4b672c]">
    <p className="font-semibold">Subscription-level data</p>
    <p className="mt-1 leading-6">
      Start date, expiry date, payment status, renewal status and
      Included → Used → Remaining entitlement counts are tracked
      per business on the Digital Partners page, not here — this
      page only configures the package template.
    </p>
  </div>
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
               </div>
         
               <Toast toasts={toasts} removeToast={removeToast} />
             </main>
           )
         }
         
         function Input({ label, value, onChange, placeholder, required = false, type = 'text', min }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#0b1830]">{label}</label>

      <input
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#668b2f]"
      />
    </div>
  )
}


function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#0b1830]">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#668b2f]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-2xl font-bold text-[#0b1830]">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    Active: 'bg-[#e7f4df] text-[#4b7a28]',
    Inactive: 'bg-gray-100 text-gray-500',
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || 'bg-gray-100 text-gray-500'
      }`}
    >
      {status}
    </span>
  )
}