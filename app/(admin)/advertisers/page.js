'use client'
import { useEffect, useState } from 'react'

const inputCls = "h-10 w-full rounded-lg border px-3 text-sm"
const inputStyle = { borderColor: '#D9E0E7' }
const labelCls = "mb-1.5 text-xs font-semibold uppercase tracking-wide"
const labelStyle = { color: '#94A3B8' }

function Field({ label, children }) {
  return (
    <div>
      <p className={labelCls} style={labelStyle}>{label}</p>
      {children}
    </div>
  )
}


function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-semibold text-white transition-all
            ${t.type === "success" ? "bg-[#2F7D1B]" : ""}
            ${t.type === "error"   ? "bg-red-600"   : ""}
            ${t.type === "info"    ? "bg-[#0B1830]" : ""}
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

const PAYMENT_STYLES = {
  pending: { backgroundColor: '#FEF3C7', color: '#92400E' },
  paid: { backgroundColor: '#E8F5E4', color: '#2F7D1B' },
  overdue: { backgroundColor: '#FEE2E2', color: '#B3261E' },
}

function AdvertiserDrawer({ advertiser, onClose, onSave, onDelete, saving, deleting }) {
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (advertiser) {
      setForm({
        advertiserName: advertiser.advertiserName || '',
        telephone: advertiser.telephone || '',
      })
    }
  }, [advertiser])

  if (!advertiser || !form) return null

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold" style={{ color: '#0B1830' }}>Edit Advertiser</h3>
          <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-widest" style={{ color: '#2F7D1B' }}>Business</p>
        <div className="mt-3 space-y-1.5 rounded-lg border px-3 py-2.5" style={{ borderColor: '#D9E0E7' }}>
          <p className="text-sm font-semibold" style={{ color: '#0B1830' }}>
            {advertiser.business?.businessName || '—'}
          </p>
          <p className="text-xs" style={{ color: '#64748B' }}>{advertiser.business?.email || '—'}</p>
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-widest" style={{ color: '#2F7D1B' }}>Advertiser details</p>
        <div className="mt-3 space-y-4">
          <Field label="Advertiser name">
            <input className={inputCls} style={inputStyle} value={form.advertiserName} onChange={(e) => set('advertiserName', e.target.value)} />
          </Field>

          <Field label="Telephone">
            <input className={inputCls} style={inputStyle} value={form.telephone} onChange={(e) => set('telephone', e.target.value)} />
          </Field>
        </div>

        {/* <p className="mt-8 text-xs font-bold uppercase tracking-widest" style={{ color: '#2F7D1B' }}>
          Print bookings ({advertiser.printBookings?.length || 0})
        </p>
        <div className="mt-3 space-y-2">
          {(advertiser.printBookings || []).length === 0 ? (
            <p className="text-sm" style={{ color: '#94A3B8' }}>No bookings yet.</p>
          ) : (
            advertiser.printBookings.map((booking) => (
              <div key={booking.id} className="rounded-lg border px-3 py-2.5" style={{ borderColor: '#D9E0E7' }}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold" style={{ color: '#0B1830' }}>
                    {booking.publication?.title || '—'}
                  </p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={PAYMENT_STYLES[booking.paymentStatus] || { backgroundColor: '#F1F5F9', color: '#64748B' }}
                  >
                    {booking.paymentStatus}
                  </span>
                </div>
                <p className="mt-0.5 text-xs" style={{ color: '#64748B' }}>
                  {booking.package?.name || 'No package'} · {new Date(booking.startDate).toLocaleDateString('en-IE')}
                  {booking.expiryDate ? ` – ${new Date(booking.expiryDate).toLocaleDateString('en-IE')}` : ''}
                </p>
              </div>
            ))
          )}
        </div> */}

        <div className="mt-8 space-y-2">
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: '#2F7D1B' }}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
         
        </div>
      </div>
    </div>
  )
}

export default function AdvertisersManagementPage() {
  const [advertisers, setAdvertisers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  const { toasts, addToast, removeToast } = useToast()



  async function loadAdvertisers() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter !== 'all') params.set('paymentStatus', filter)
    params.set('page', page)
    params.set('pageSize', pageSize)

    const res = await fetch(`/api/admin/advertisers?${params.toString()}`)
    const data = await res.json()

    if (res.ok) {
      setAdvertisers(data.advertisers || [])
      setTotalPages(data.totalPages || 1)
      setTotalCount(data.totalCount || 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAdvertisers()
  }, [filter, page])

  useEffect(() => {
    setPage(1)
  }, [filter])



  useEffect(() => {
    loadAdvertisers()
  }, [filter])

  async function handleSave(form) {
    setSaving(true)
    const res = await fetch(`/api/admin/advertisers/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      addToast(data.error || 'Save failed.', 'error')
      return
    }

    addToast(`"${selected.advertiserName}" updated`, 'success')
    setSelected(null)
    loadAdvertisers()
  }

  async function handleDelete(id) {
    if (!confirm('Remove this Advertiser? This cannot be undone.')) return
    setDeleting(true)
    const res = await fetch(`/api/admin/advertisers/${id}`, { method: 'DELETE' })
    const data = await res.json()
    setDeleting(false)

    if (!res.ok) {
      addToast(data.error || 'Delete failed. They may have existing bookings.', 'error')
      return
    }

    addToast('Advertiser removed', 'success')
    setSelected(null)
    loadAdvertisers()
  }

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#0B1830' }}>
        Advertisers
      </h1>
      <p className="text-sm mb-6" style={{ color: '#64748B' }}>
        Every business with print advertising bookings.
      </p>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All' },
         
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={
              filter === f.key
                ? { backgroundColor: '#0B1830', color: 'white' }
                : { backgroundColor: '#F1F5F9', color: '#64748B' }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: '#64748B' }}>Loading...</p>
      ) : advertisers.length === 0 ? (
        <p className="text-sm" style={{ color: '#64748B' }}>No advertisers found.</p>
      ) : (
        <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: '#D9E0E7' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: '#64748B' }}>Business</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: '#64748B' }}>Advertiser name</th>
                
                <th className="text-left px-5 py-3 font-semibold" style={{ color: '#64748B' }}>Bookings</th>
    
                <th className="text-left px-5 py-3 font-semibold" style={{ color: '#64748B' }}></th>
              </tr>
            </thead>
            <tbody>
              {advertisers.map((a) => (
                <tr key={a.id} style={{ borderTop: '1px solid #D9E0E7' }}>
                  <td className="px-5 py-3 font-semibold" style={{ color: '#0B1830' }}>
                    {a.business?.businessName || '—'}
                  </td>
                  <td className="px-5 py-3" style={{ color: '#0B1830' }}>
                    {a.advertiserName}
                  </td>
                
                  <td className="px-5 py-3" style={{ color: '#64748B' }}>
                    {a.printBookings?.length || 0}
                  </td>
                 
                  <td className="px-5 py-3">
                    <button
                      onClick={() => setSelected(a)}
                      className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                      style={{ borderColor: '#D9E0E7', color: '#0B1830' }}
                    >
                      View / Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

{!loading && advertisers.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs" style={{ color: '#64748B' }}>
            Page {page} of {totalPages} · {totalCount} advertiser{totalCount === 1 ? '' : 's'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              style={{ borderColor: '#D9E0E7', color: '#0B1830' }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              style={{ borderColor: '#D9E0E7', color: '#0B1830' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
      

<AdvertiserDrawer
        advertiser={selected}
        onClose={() => setSelected(null)}
        onSave={handleSave}
        onDelete={handleDelete}
        saving={saving}
        deleting={deleting}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}