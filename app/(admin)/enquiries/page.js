"use client";


import { useState, useEffect, useCallback, useMemo, useRef } from "react";


const STATUS_LABELS = {
  received: "Received",


  failed: "Failed",
};

const STATUS_STYLES = {
  received: "bg-[#eef2fb] text-[#3355a8]",
  forwarded_to_ghl: "bg-amber-50 text-amber-600",
  delivered: "bg-[#edf5df] text-[#527323]",
  failed: "bg-red-50 text-red-600",
};



function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-semibold text-white transition-all
            ${t.type === "success" ? "bg-[#527323]" : ""}
            ${t.type === "error"   ? "bg-red-600"   : ""}
            ${t.type === "info"    ? "bg-[#0b1830]" : ""}
          `}
        >
          {t.type === "success" && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 shrink-0">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
          {t.type === "error" && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 shrink-0">
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          )}
          {t.type === "info" && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 shrink-0">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
          )}

          <span>{t.message}</span>

          <button onClick={() => removeToast(t.id)} className="ml-1 opacity-70 hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);

  function addToast(message, type = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3500);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return { toasts, addToast, removeToast };
}



function EnquiryDrawer({ enquiry, onClose, onRetry, retrying }) {
  if (!enquiry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_STYLES[enquiry.status]}`}
            >
              {STATUS_LABELS[enquiry.status] || enquiry.status}
            </span>
            <h3 className="mt-2 text-lg font-bold text-[#0b1830]">{enquiry.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 space-y-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Contact</p>
            <p className="mt-1 text-[#0b1830]">{enquiry.email}</p>
            {enquiry.phone && <p className="text-[#0b1830]">{enquiry.phone}</p>}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Business</p>
            <p className="mt-1 text-[#0b1830]">
              {enquiry.businessProfile?.business?.businessName || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Publication</p>
            <p className="mt-1 text-[#0b1830]">{enquiry.publication?.title || "—"}</p>
          </div>

          {enquiry.message && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Message</p>
              <p className="mt-1 whitespace-pre-wrap leading-6 text-[#0b1830]">{enquiry.message}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Consent given</p>
            <p className="mt-1 text-[#0b1830]">{enquiry.consentGiven ? "Yes" : "No"}</p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">GoHighLevel</p>
            <div className="mt-2 space-y-1.5 text-xs text-gray-600">
              <p>
                Contact ID:{" "}
                <code className="rounded bg-white px-1.5 py-0.5 text-[11px] text-gray-500">
                  {enquiry.ghlContactId || "not synced"}
                </code>
              </p>
              <p>
                Opportunity ID:{" "}
                <code className="rounded bg-white px-1.5 py-0.5 text-[11px] text-gray-500">
                  {enquiry.ghlOpportunityId || "—"}
                </code>
              </p>
              <p>
                Forwarded:{" "}
                {enquiry.forwardedAt
                  ? new Date(enquiry.forwardedAt).toLocaleString("en-IE")
                  : "not yet"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Submitted</p>
            <p className="mt-1 text-[#0b1830]">
              {new Date(enquiry.createdAt).toLocaleString("en-IE")}
            </p>
          </div>
        </div>

        {enquiry.status === "failed" && (
          <button
            onClick={() => onRetry(enquiry)}
            disabled={retrying}
            className="mt-6 w-full rounded-xl bg-[#668b2f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#527323] disabled:opacity-60"
          >
            {retrying ? "Retrying…" : "Retry GHL delivery"}
          </button>
        )}
      </div>
    </div>
  );
}



function EnquiryRow({ enquiry, onOpen }) {
  return (
    <button
      onClick={() => onOpen(enquiry)}
      className="flex w-full items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_STYLES[enquiry.status]}`}
        >
          {STATUS_LABELS[enquiry.status] || enquiry.status}
        </span>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#0b1830]">{enquiry.name}</p>
          <p className="truncate text-xs text-gray-400">
            {enquiry.businessProfile?.business?.businessName || "No business"} ·{" "}
            {enquiry.publication?.title || "—"}
          </p>
        </div>
      </div>

      <span className="shrink-0 text-xs text-gray-400">
        {new Date(enquiry.createdAt).toLocaleDateString("en-IE", {
          day: "2-digit",
          month: "short",
        })}
      </span>
    </button>
  );
}



export default function EnquiriesPage() {
  const [enquiries,       setEnquiries]       = useState([]);
  const [publications,    setPublications]    = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [statusFilter,    setStatusFilter]    = useState("");
  const [publicationFilter, setPublicationFilter] = useState("");
  const [search,          setSearch]          = useState("");
  const [selected,        setSelected]        = useState(null);
  const [retrying,        setRetrying]        = useState(false);

  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const { toasts, addToast, removeToast } = useToast();


  const requestIdRef = useRef(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    const requestId = ++requestIdRef.current;
  
    const params = new URLSearchParams();
    if (statusFilter)      params.set("status", statusFilter);
    if (publicationFilter) params.set("publicationId", publicationFilter);
    if (search)             params.set("search", search);
    params.set("page", page);
    params.set("pageSize", pageSize);
  
    const [enqRes, pubsRes] = await Promise.all([
      fetch(`/api/admin/enquiries?${params.toString()}`),
      fetch("/api/admin/publications"),
    ]);
    const enqData = await enqRes.json();
    const pubsData = await pubsRes.json();
  
    // Ignore this response if a newer request has been fired since.
    if (requestId !== requestIdRef.current) return;
  
    setEnquiries(enqData.enquiries || []);
    setTotalPages(enqData.totalPages || 1);
    setTotalCount(enqData.totalCount || 0);
    setPublications(pubsData.publications || []);
    setLoading(false);
  }, [statusFilter, publicationFilter, search, page]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  useEffect(() => {
    setPage(1);
  }, [statusFilter, publicationFilter, search]);
  const filtered = enquiries;

  async function handleRetry(enquiry) {
    setRetrying(true);
    const res = await fetch(`/api/admin/enquiries/${enquiry.id}/retry`, { method: "POST" });
    const data = await res.json();
    setRetrying(false);

    if (!res.ok) {
      addToast(data.error || "Retry failed", "error");
      return;
    }

    addToast(`Resent "${enquiry.name}" to GoHighLevel`, "success");
    setSelected(data.enquiry);
    loadData();
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">

       
        <div className="mb-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0b1830]">
                Enquiries
              </h1>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Reader enquiries routed from Mara to GoHighLevel, then delivered to the business.
              </p>
            </div>

          </div>
        </div>

       
          
        {(totalCount > 0 || search || statusFilter || publicationFilter) && (
  <div className="mb-5 flex flex-wrap items-center gap-3">
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search name, email, business…"
      className="h-10 w-56 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#668b2f] focus:outline-none"
    />

    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#668b2f] focus:outline-none"
    >
      <option value="">All statuses</option>
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>

    {(search || statusFilter || publicationFilter) && (
      <button
        onClick={() => {
          setSearch("");
          setStatusFilter("");
          setPublicationFilter("");
        }}
        className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-500 hover:bg-gray-50"
      >
        Clear filters
      </button>
    )}
  </div>
)}


{loading ? (
          <div className="grid place-items-center py-20">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : totalCount === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="text-sm text-gray-400">
              {search || statusFilter || publicationFilter
                ? "No enquiries match these filters."
                : "No enquiries yet."}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="text-sm text-gray-400">No enquiries match these filters.</p>
          </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {filtered.map((enquiry) => (
                      <EnquiryRow key={enquiry.id} enquiry={enquiry} onOpen={setSelected} />
                    ))}
                  </div>
                )}
        
                {!loading && filtered.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Page {page} of {totalPages} · {totalCount} enquir{totalCount === 1 ? "y" : "ies"}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-[#0b1830] disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-[#0b1830] disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
        
              <EnquiryDrawer
        enquiry={selected}
        onClose={() => setSelected(null)}
        onRetry={handleRetry}
        retrying={retrying}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </main>
  );
}