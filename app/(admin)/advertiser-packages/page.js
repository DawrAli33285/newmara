'use client'

import { useState } from 'react'

const publications = [
  'The Skipper',
  'Take Off',
  'Go West',
  'Due South',
  'The Business',
]

const printEntitlements = [
  'Artwork upload',
  'Artwork replacement',
  'Proof approval',
  'Quarter-page advert',
  'Half-page advert',
  'Full-page advert',
  'Double-page spread',
  'Priority placement',
  'Inside front cover',
  'Inside back cover',
  'Back cover',
  'Single issue',
  'Multiple issues',
  'Multiple publications',
]

const initialPackages = [
  {
    id: 1,
    name: '',
    code: '',
    description: 'Print advertiser package details to be confirmed.',
    price: '',
    currency: 'EUR',
    billingPeriod: '',
    advertFormat: '',
    issueCount: '',
    placement: '',
    status: 'Draft',
    publications: [],
    entitlements: [],
  },
]

export default function AdvertiserPackagesPage() {
  const [packages, setPackages] = useState(initialPackages)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm())

  function emptyForm() {
    return {
      name: '',
      code: '',
      description: '',
      price: '',
      currency: 'EUR',
      billingPeriod: '',
      advertFormat: '',
      issueCount: '',
      placement: '',
      status: 'Draft',
      publications: [],
      entitlements: [],
    }
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function toggleListValue(field, value) {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }))
  }

  function openCreateForm() {
    setEditingId(null)
    setForm(emptyForm())
    setShowForm(true)
  }

  function openEditForm(packageItem) {
    setEditingId(packageItem.id)
    setForm({
      ...packageItem,
      publications: packageItem.publications || [],
      entitlements: packageItem.entitlements || [],
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm())
  }

  function savePackage(event) {
    event.preventDefault()

    const packageItem = {
      id: editingId || Date.now(),
      ...form,
    }

    if (editingId) {
      setPackages((current) =>
        current.map((item) =>
          item.id === editingId ? packageItem : item
        )
      )
    } else {
      setPackages((current) => [...current, packageItem])
    }

    closeForm()
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
              Advertiser packages
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              Configure packages for print advertisers. Print advertisers may
              be Print Only or Print + Digital, but a print package does not
              automatically provide Digital Partner functionality.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-[#668b2f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#527322]"
          >
            + Create advertiser package
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Total packages" value={packages.length} />

          <SummaryCard
            label="Active packages"
            value={packages.filter((item) => item.status === 'Active').length}
          />

          <SummaryCard
            label="Print entitlements"
            value={printEntitlements.length}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {packages.map((packageItem) => (
            <div
              key={packageItem.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#668b2f]">
                    Print advertiser
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-[#0b1830]">
                    {packageItem.name || 'Unnamed package'}
                  </h2>
                </div>

                <StatusBadge status={packageItem.status} />
              </div>

              <div className="mb-5 rounded-xl bg-[#f7f8fa] p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Price
                </p>

                <p className="mt-1 text-xl font-bold text-[#0b1830]">
                  {packageItem.price
                    ? `${packageItem.currency} ${packageItem.price}`
                    : 'To be confirmed'}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {packageItem.billingPeriod || 'Billing period not set'}
                </p>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                <InfoItem
                  label="Format"
                  value={packageItem.advertFormat || 'Not configured'}
                />

                <InfoItem
                  label="Issues"
                  value={packageItem.issueCount || 'Not configured'}
                />

                <InfoItem
                  label="Placement"
                  value={packageItem.placement || 'Not configured'}
                />

                <InfoItem
                  label="Publications"
                  value={
                    packageItem.publications?.length || 'Not configured'
                  }
                />
              </div>

              <p className="mb-5 min-h-[48px] text-sm leading-6 text-gray-500">
                {packageItem.description || 'No description added.'}
              </p>

              <div className="mb-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                  Included print features
                </p>

                <p className="text-sm text-gray-600">
                  {packageItem.entitlements?.length || 0} configurable features
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

        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0b1830]/50 p-4">
            <div className="mx-auto my-8 max-w-4xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#668b2f]">
                    Print advertiser package
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
                <div className="rounded-xl border border-[#dfe9cf] bg-[#f6faef] p-4 text-sm leading-6 text-[#4b672c]">
                  This is a print advertiser package. Digital Partner
                  entitlements such as profiles, offers, videos and digital
                  analytics must be assigned separately.
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Package name"
                    value={form.name}
                    onChange={(value) => updateField('name', value)}
                    placeholder="Package name to be confirmed"
                    required
                  />

                  <Input
                    label="Package code"
                    value={form.code}
                    onChange={(value) => updateField('code', value)}
                    placeholder="PRINT-PACKAGE-CODE"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0b1830]">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      updateField('description', event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#668b2f]"
                    placeholder="Describe the print package"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Input
                    label="Price"
                    value={form.price}
                    onChange={(value) => updateField('price', value)}
                    placeholder="To be confirmed"
                  />

                  <Select
                    label="Currency"
                    value={form.currency}
                    onChange={(value) => updateField('currency', value)}
                    options={['EUR', 'GBP', 'USD']}
                  />

                  <Select
                    label="Billing period"
                    value={form.billingPeriod}
                    onChange={(value) =>
                      updateField('billingPeriod', value)
                    }
                    options={['Not set', 'Per issue', 'Per campaign', 'One-off']}
                  />

                  <Select
                    label="Status"
                    value={form.status}
                    onChange={(value) => updateField('status', value)}
                    options={['Draft', 'Active', 'Inactive']}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Select
                    label="Advert format"
                    value={form.advertFormat}
                    onChange={(value) =>
                      updateField('advertFormat', value)
                    }
                    options={[
                      'Not set',
                      'Quarter page',
                      'Half page',
                      'Full page',
                      'Double-page spread',
                    ]}
                  />

                  <Input
                    label="Number of issues"
                    value={form.issueCount}
                    onChange={(value) => updateField('issueCount', value)}
                    placeholder="To be confirmed"
                  />

                  <Select
                    label="Placement"
                    value={form.placement}
                    onChange={(value) => updateField('placement', value)}
                    options={[
                      'Not set',
                      'Standard placement',
                      'Priority placement',
                      'Inside front cover',
                      'Inside back cover',
                      'Back cover',
                    ]}
                  />
                </div>

                <CheckboxGroup
                  title="Available publications"
                  options={publications}
                  selected={form.publications}
                  onToggle={(value) =>
                    toggleListValue('publications', value)
                  }
                />

                <CheckboxGroup
                  title="Included print entitlements"
                  options={printEntitlements}
                  selected={form.entitlements}
                  onToggle={(value) =>
                    toggleListValue('entitlements', value)
                  }
                />

                <div className="rounded-xl border border-gray-200 bg-[#fafbfc] p-4 text-sm leading-6 text-gray-600">
                  <p className="font-semibold text-[#0b1830]">
                    Advertiser account fields
                  </p>

                  <p className="mt-1">
                    Print advertiser status, Digital Partner status,
                    publication relationships, start date, expiry or renewal
                    date, payment status and renewal status should be stored
                    against the advertiser account or booking—not permanently
                    inside this package template.
                  </p>
                </div>

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
                    className="rounded-lg bg-[#668b2f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#527322]"
                  >
                    {editingId ? 'Save changes' : 'Create package'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function Input({ label, value, onChange, placeholder, required = false }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#0b1830]">
        {label}
      </label>

      <input
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
      <label className="mb-2 block text-sm font-semibold text-[#0b1830]">
        {label}
      </label>

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

function CheckboxGroup({ title, options, selected, onToggle }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <label className="text-sm font-semibold text-[#0b1830]">
          {title}
        </label>

        <span className="text-xs text-gray-400">
          {selected.length} selected
        </span>
      </div>

      <div className="grid gap-2 rounded-xl border border-gray-200 bg-[#fafbfc] p-4 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-3 rounded-lg bg-white px-3 py-2.5 text-sm text-gray-600 hover:bg-[#edf5df]"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
              className="h-4 w-4 accent-[#668b2f]"
            />

            {option}
          </label>
        ))}
      </div>
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg bg-[#f7f8fa] p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-xs font-semibold text-[#0b1830]">{value}</p>
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
    Draft: 'bg-[#fff4d6] text-[#9a6a00]',
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