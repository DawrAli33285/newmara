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

function objectToLines(social) {
  if (!social || typeof social !== 'object') return ''
  return Object.entries(social)
    .filter(([, url]) => Boolean(url))
    .map(([network, url]) => `${network}: ${url}`)
    .join('\n')
}

function linesToObject(text) {
  if (!text) return {}
  const result = {}
  text.split('\n').forEach((line) => {
    const idx = line.indexOf(':')
    if (idx === -1) return
    const key = line.slice(0, idx).trim().toLowerCase()
    const value = line.slice(idx + 1).trim()
    if (key && value) result[key] = value
  })
  return result
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

function PartnerDrawer({ partner, packages, publications, destinations, onClose, onSave, onDelete, saving, deleting }) {
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (partner) {
      setForm({
     
        packageId: partner.packageId || '',
        publicationIds: partner.publications?.map((pp) => pp.publicationId) || [],
        paymentStatus: partner.paymentStatus || 'pending',
        isActive: partner.isActive ?? true,
        startDate: partner.startDate ? partner.startDate.slice(0, 10) : '',
        expiryDate: partner.expiryDate ? partner.expiryDate.slice(0, 10) : '',
       
        businessName: partner.businessProfile?.business?.businessName || '',
        logoUrl: partner.businessProfile?.logoUrl || '',
        description: partner.businessProfile?.description || '',
        location: partner.businessProfile?.location || '',
        destinationId: partner.businessProfile?.destinationId || '',
        website: partner.businessProfile?.website || '',
        telephone: partner.businessProfile?.telephone || '',
        mapUrl: partner.businessProfile?.mapUrl || '',
        socialLinks: objectToLines(partner.businessProfile?.socialLinks),
        ctaText: partner.businessProfile?.ctaText || '',
        ctaUrl: partner.businessProfile?.ctaUrl || '',
      })
    }
  }, [partner])

  if (!partner || !form) return null

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function togglePublication(id) {
    setForm((prev) => ({
      ...prev,
      publicationIds: prev.publicationIds.includes(id)
        ? prev.publicationIds.filter((p) => p !== id)
        : [...prev.publicationIds, id],
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold" style={{ color: '#0B1830' }}>Edit Digital Partner</h3>
          <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

     
        <p className="mt-6 text-xs font-bold uppercase tracking-widest" style={{ color: '#2F7D1B' }}>Business profile</p>
        <div className="mt-3 space-y-4">
          <Field label="Business name">
            <input className={inputCls} style={inputStyle} value={form.businessName} onChange={(e) => set('businessName', e.target.value)} />
          </Field>

          <Field label="Logo URL">
            <input className={inputCls} style={inputStyle} value={form.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} />
          </Field>

          <Field label="Description">
            <textarea rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" style={inputStyle} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>

          <Field label="Location">
            <input className={inputCls} style={inputStyle} value={form.location} onChange={(e) => set('location', e.target.value)} />
          </Field>

          <Field label="Payment status">
  <p className="rounded-lg border px-3 py-2 text-sm capitalize" style={{ ...inputStyle, backgroundColor: '#F8FAFC', color: '#64748B' }}>
    {form.paymentStatus || 'No active subscription'}
  </p>
</Field>

          <Field label="Website">
            <input className={inputCls} style={inputStyle} value={form.website} onChange={(e) => set('website', e.target.value)} />
          </Field>

          <Field label="Telephone">
            <input className={inputCls} style={inputStyle} value={form.telephone} onChange={(e) => set('telephone', e.target.value)} />
          </Field>

          <Field label="Map link">
            <input className={inputCls} style={inputStyle} value={form.mapUrl} onChange={(e) => set('mapUrl', e.target.value)} />
          </Field>

          <Field label="Social links">
            <textarea rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" style={inputStyle} placeholder="instagram: https://instagram.com/handle" value={form.socialLinks} onChange={(e) => set('socialLinks', e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="CTA text">
              <input className={inputCls} style={inputStyle} value={form.ctaText} onChange={(e) => set('ctaText', e.target.value)} />
            </Field>
            <Field label="CTA URL">
              <input className={inputCls} style={inputStyle} value={form.ctaUrl} onChange={(e) => set('ctaUrl', e.target.value)} />
            </Field>
          </div>
        </div>

      
        <p className="mt-8 text-xs font-bold uppercase tracking-widest" style={{ color: '#2F7D1B' }}>Digital Partner</p>
        <div className="mt-3 space-y-4">
          <Field label="Package">
            <select className={inputCls} style={inputStyle} value={form.packageId} onChange={(e) => set('packageId', e.target.value)}>
              <option value="">Select package…</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Publications">
            <div className="flex flex-wrap gap-2">
              {publications.map((pub) => (
                <button
                  key={pub.id}
                  type="button"
                  onClick={() => togglePublication(pub.id)}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={
                    form.publicationIds.includes(pub.id)
                      ? { backgroundColor: '#2F7D1B', color: 'white' }
                      : { backgroundColor: '#F1F5F9', color: '#64748B' }
                  }
                >
                  {pub.title}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Payment status">
  <select className={inputCls} style={inputStyle} value={form.paymentStatus} onChange={(e) => set('paymentStatus', e.target.value)}>
    <option value="pending">Pending</option>
    <option value="active">Active</option>
    <option value="overdue">Overdue</option>
    <option value="cancelled">Cancelled</option>
  </select>
</Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date">
              <input type="date" className={inputCls} style={inputStyle} value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
            </Field>
            <Field label="Expiry date">
              <input type="date" className={inputCls} style={inputStyle} value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm" style={{ color: '#0B1830' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
            Active
          </label>
        </div>

        <div className="mt-8 space-y-2">
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: '#2F7D1B' }}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            onClick={() => onDelete(partner.id)}
            disabled={deleting}
            className="w-full rounded-lg border px-4 py-2.5 text-sm font-bold disabled:opacity-60"
            style={{ color: '#B3261E', borderColor: '#B3261E' }}
          >
            {deleting ? 'Removing…' : 'Remove Digital Partner'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DigitalPartnersPage() {
  const [partners, setPartners] = useState([])
  const [packages, setPackages] = useState([])
  const [publications, setPublications] = useState([])
  const [destinations, setDestinations] = useState([])
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

  async function loadPartners() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter === 'active') params.set('isActive', 'true')
    if (filter === 'inactive') params.set('isActive', 'false')
    params.set('page', page)
    params.set('pageSize', pageSize)

    const [partnersRes, packagesRes, pubsRes, destRes] = await Promise.all([
      fetch(`/api/admin/digital-partners?${params.toString()}`),
      fetch('/api/admin/digital-packages'),
      fetch('/api/admin/publications'),
      fetch('/api/admin/destinations'),
    ])
    const partnersData = await partnersRes.json()
    const packagesData = await packagesRes.json()
    const pubsData = await pubsRes.json()
    const destData = await destRes.json()

    if (partnersRes.ok) {
      setPartners(partnersData.digitalPartners)
      setTotalPages(partnersData.totalPages || 1)
      setTotalCount(partnersData.totalCount || 0)
    }
    setPackages(packagesData.packages || packagesData.digitalPackages || [])
    setPublications(pubsData.publications || [])
    setDestinations(destData.destinations || [])
    setLoading(false)
  }

  useEffect(() => {
    loadPartners()
  }, [filter, page])

  useEffect(() => {
    setPage(1)
  }, [filter])

 
  async function handleSave(form) {
    setSaving(true)
    const { paymentStatus, ...rest } = form
    const payload = { ...rest, socialLinks: linesToObject(form.socialLinks) }
    const res = await fetch(`/api/admin/digital-partners/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      addToast(data.error || 'Save failed.', 'error')
      return
    }

    addToast(`"${form.businessName}" updated`, 'success')
    setSelected(null)
    loadPartners()
  }

  async function handleDelete(id) {
    if (!confirm('Remove this Digital Partner? This cannot be undone.')) return
    setDeleting(true)
    const res = await fetch(`/api/admin/digital-partners/${id}`, { method: 'DELETE' })
    const data = await res.json()
    setDeleting(false)

    if (!res.ok) {
      addToast(data.error || 'Delete failed.', 'error')
      return
    }

    addToast('Digital Partner removed', 'success')
    setSelected(null)
    loadPartners()
  }



  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#0B1830' }}>
        Digital Partners
      </h1>
      <p className="text-sm mb-6" style={{ color: '#64748B' }}>
        Every business currently on a digital package.
      </p>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'inactive', label: 'Inactive' },
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
      ) : partners.length === 0 ? (
        <p className="text-sm" style={{ color: '#64748B' }}>No digital partners found.</p>
      ) : (
        <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: '#D9E0E7' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: '#64748B' }}>Business</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: '#64748B' }}>Package</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: '#64748B' }}>Publications</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: '#64748B' }}>Payment</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: '#64748B' }}>Status</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: '#64748B' }}>Expires</th>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: '#64748B' }}></th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} style={{ borderTop: '1px solid #D9E0E7' }}>
                  <td className="px-5 py-3 font-semibold" style={{ color: '#0B1830' }}>
                    {p.businessProfile?.business?.businessName || '—'}
                  </td>
                  <td className="px-5 py-3" style={{ color: '#0B1830' }}>
                    {p.package?.name || '—'}
                  </td>
                  <td className="px-5 py-3" style={{ color: '#64748B' }}>
                    {p.publications?.map((pp) => pp.publication.title).join(', ') || '—'}
                  </td>
                  <td className="px-5 py-3" style={{ color: '#64748B' }}>
                    {p.paymentStatus}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={
                        p.isActive
                          ? { backgroundColor: '#E8F5E4', color: '#2F7D1B' }
                          : { backgroundColor: '#F1F5F9', color: '#64748B' }
                      }
                    >
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3" style={{ color: '#64748B' }}>
                    {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString('en-IE') : 'No expiry'}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => setSelected(p)}
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

         {!loading && partners.length > 0 && (
           <div className="mt-4 flex items-center justify-between">
             <p className="text-xs" style={{ color: '#64748B' }}>
               Page {page} of {totalPages} · {totalCount} partner{totalCount === 1 ? '' : 's'}
             </p>
             <div className="flex gap-2">
               <button
                 onClick={() => setPage((p) => Math.max(1, p - 1))}
                 disabled={page <= 1}
                 className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                 style={{ backgroundColor: '#F1F5F9', color: '#0B1830' }}
               >
                 Previous
               </button>
               <button
                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                 disabled={page >= totalPages}
                 className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                 style={{ backgroundColor: '#F1F5F9', color: '#0B1830' }}
               >
                 Next
               </button>
             </div>
           </div>
         )}
   
         <PartnerDrawer
           partner={selected}
           packages={packages}
           publications={publications}
           destinations={destinations}
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