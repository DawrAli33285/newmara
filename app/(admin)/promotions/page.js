'use client'
import { useEffect, useState } from 'react'

const TABS = [
  { key: 'submitted', label: 'Pending Review' },
  { key: 'live', label: 'Live' },
  { key: 'denied', label: 'Denied' },
]

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


export default function OffersApprovalPage() {
  const [tab, setTab] = useState('submitted')
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  const { toasts, addToast, removeToast } = useToast()


  async function loadOffers(status, pageNum) {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('status', status)
    params.set('page', pageNum)
    params.set('pageSize', pageSize)

    const res = await fetch(`/api/admin/offers?${params.toString()}`)
    const data = await res.json()
    if (res.ok) {
      setOffers(data.offers)
      setTotalPages(data.totalPages || 1)
      setTotalCount(data.totalCount || 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadOffers(tab, page)
  }, [tab, page])

  useEffect(() => {
    setPage(1)
  }, [tab])

  async function handleApprove(id) {
    setBusyId(id)
    const res = await fetch(`/api/admin/offers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    })
    const data = await res.json()
    if (res.ok) {
      addToast('Offer approved', 'success')
      loadOffers(tab, page)
    } else {
      addToast(data.error || 'Something went wrong.', 'error')
    }
    setBusyId(null)
  }

  async function handleReject(id) {
    setBusyId(id)
    const res = await fetch(`/api/admin/offers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject' }),
    })
  
    const data = await res.json()
    if (res.ok) {
      addToast('Offer rejected', 'info')
      loadOffers(tab, page)
    } else {
      addToast(data.error || 'Something went wrong.', 'error')
    }
    setBusyId(null)
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#0B1830' }}>
        Offers & Promotions
      </h1>
      <p className="text-sm mb-6" style={{ color: '#64748B' }}>
        Review offers submitted by Digital Partners before they go live.
      </p>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={
              tab === t.key
                ? { backgroundColor: '#0B1830', color: 'white' }
                : { backgroundColor: '#F1F5F9', color: '#64748B' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: '#64748B' }}>Loading...</p>
      ) : offers.length === 0 ? (
        <p className="text-sm" style={{ color: '#64748B' }}>No offers here.</p>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="rounded-2xl border bg-white p-5"
              style={{ borderColor: '#D9E0E7' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold" style={{ color: '#0B1830' }}>{offer.title}</p>
                  <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                    {offer.businessProfile?.business?.businessName} · {offer.publication?.title}
                  </p>
                  {offer.description && (
                    <p className="text-sm mt-2" style={{ color: '#0B1830' }}>{offer.description}</p>
                  )}
                  <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>
                    {new Date(offer.startDate).toLocaleDateString('en-IE')} → {new Date(offer.expiryDate).toLocaleDateString('en-IE')}
                    {' · '}Visibility: {offer.visibility || 'public'}
                  </p>
                </div>

                {offer.status === 'submitted' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(offer.id)}
                      disabled={busyId === offer.id}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                      style={{ backgroundColor: '#2F7D1B' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(offer.id)}
                      disabled={busyId === offer.id}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-50"
                      style={{ color: '#B3261E', border: '1px solid #B3261E' }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
              </div>
          ))}
                </div>
      )}

      {!loading && offers.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs" style={{ color: '#64748B' }}>
            Page {page} of {totalPages} · {totalCount} offer{totalCount === 1 ? '' : 's'}
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

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}