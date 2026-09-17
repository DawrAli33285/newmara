"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const STATUSES = [
  "draft",
  "live",
  "denied",
];

const STATUS_LABELS = {
  draft: "Draft",
  submitted: "Submitted",
  mara_review: "Mara Review",
  approved: "Approved",
  scheduled: "Scheduled",
  live: "Live",
  expired: "Expired",
  denied: "Denied",
};

const STATUS_STYLES = {
  draft: "bg-gray-100 text-gray-500",
  submitted: "bg-[#eef2fb] text-[#3355a8]",
  mara_review: "bg-amber-50 text-amber-600",
  approved: "bg-[#edf5df] text-[#527323]",
  scheduled: "bg-[#eef2fb] text-[#3355a8]",
  live: "bg-[#edf5df] text-[#527323]",
  expired: "bg-gray-100 text-gray-400",
  denied: "bg-red-50 text-red-600",
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



function ListingModal({ listing, publications, destinations, categories, onClose, onSaved }) {
  const isEdit = Boolean(listing);

  const [businesses, setBusinesses] = useState([]);
  const [businessSearch, setBusinessSearch] = useState("");

  const [form, setForm] = useState({
    businessId: listing?.businessId || "",
    businessName: listing?.businessName || "",
    categoryId: listing?.business?.category?.id || "",
    location: listing?.location || "",
    telephone: listing?.telephone || "",
    website: listing?.website || "",
    publicationIds: listing?.publications?.map((p) => p.id) || [],
    destinationIds: listing?.assignments?.map((a) => a.destinationId).filter(Boolean) || [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedBusiness = businesses.find((b) => b.id === form.businessId)
    || (listing?.business ? listing.business : null);

  useEffect(() => {
    const t = setTimeout(async () => {
      const params = new URLSearchParams();
      if (businessSearch) params.set("search", businessSearch);
      const res = await fetch(`/api/admin/businesses?${params.toString()}`);
      const data = await res.json();
      setBusinesses(data.businesses || []);
    }, 250);
    return () => clearTimeout(t);
  }, [businessSearch]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function togglePublication(id) {
    setForm((f) => ({
      ...f,
      publicationIds: f.publicationIds.includes(id)
        ? f.publicationIds.filter((p) => p !== id)
        : [...f.publicationIds, id],
    }));
  }

  function toggleDestination(id) {
    setForm((f) => ({
      ...f,
      destinationIds: f.destinationIds.includes(id)
        ? f.destinationIds.filter((d) => d !== id)
        : [...f.destinationIds, id],
    }));
  }

  const filteredDestinations = destinations.filter((d) => {
    if (d.level !== "destination") return false;
    if (form.publicationIds.length && !form.publicationIds.includes(d.publicationId)) return false;
    return true;
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = isEdit
      ? `/api/admin/directory-listings/${listing.id}`
      : "/api/admin/directory-listings";

    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    onSaved(data.listing);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-[#0b1830]">
          {isEdit ? "Edit directory listing" : "Add directory listing"}
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Smaller and service-based businesses, separate from Digital Partner packages.
        </p>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Business</label>
            {isEdit ? (
              <p className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                {listing.business?.businessName || "—"}
              </p>
            ) : (
              <>
                <input
                  value={businessSearch}
                  onChange={(e) => setBusinessSearch(e.target.value)}
                  placeholder="Search business by name or email…"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
                />
                <select
                  value={form.businessId}
                  onChange={(e) => {
                    const biz = businesses.find((b) => b.id === e.target.value);
                    update("businessId", e.target.value);
                    if (biz) update("businessName", biz.businessName);
                  }}
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
                >
                  <option value="">Select business…</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.businessName} ({b.email})
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div>
  <label className="mb-1 block text-xs font-semibold text-gray-600">Category</label>
  <select
    value={form.categoryId}
    onChange={(e) => update("categoryId", e.target.value)}
    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
  >
    <option value="">Select category…</option>
    {categories.map((c) => (
      <option key={c.id} value={c.id}>{c.name}</option>
    ))}
  </select>
  <p className="mt-1 text-[11px] text-gray-400">
    Sets the category on the business record.
  </p>
</div>

{isEdit && (
  <div>
    <label className="mb-1 block text-xs font-semibold text-gray-600">Payment status</label>
    <p className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 capitalize">
      {listing?.business?.subscriptions?.[0]?.status || "No active subscription"}
    </p>
  </div>
)}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Business name</label>
            <input
              value={form.businessName}
              onChange={(e) => update("businessName", e.target.value)}
              placeholder="e.g. Dublin Bay Taxis"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Location</label>
            <input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g. Dublin Airport, Terminal 1"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Telephone</label>
              <input
                value={form.telephone}
                onChange={(e) => update("telephone", e.target.value)}
                placeholder="+353…"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Website</label>
              <input
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                type="url"
                placeholder="https://…"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Publications</label>
            <div className="flex flex-wrap gap-2">
              {publications.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePublication(p.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition
                    ${form.publicationIds.includes(p.id)
                      ? "border-[#668b2f] bg-[#edf5df] text-[#527323]"
                      : "border-gray-200 text-gray-500 hover:border-[#668b2f]/40"}`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Destinations</label>
            <div className="flex flex-wrap gap-2">
              {filteredDestinations.length === 0 && (
                <p className="text-xs text-gray-400">No destinations available for the selected publication(s).</p>
              )}
              {filteredDestinations.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDestination(d.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition
                    ${form.destinationIds.includes(d.id)
                      ? "border-[#668b2f] bg-[#edf5df] text-[#527323]"
                      : "border-gray-200 text-gray-500 hover:border-[#668b2f]/40"}`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#668b2f] px-5 py-2 text-sm font-bold text-white hover:bg-[#527323] disabled:opacity-60"
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function ReviewModal({ listing, onClose, addToast, onSaved }) {
  const [status, setStatus] = useState(listing.status);
  const [rejectionReason, setRejectionReason] = useState(listing.rejectionReason || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");

    const res = await fetch(`/api/admin/directory-listings/${listing.id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        rejectionReason: status === "denied" ? rejectionReason : undefined,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    addToast(`"${listing.businessName}" marked as ${STATUS_LABELS[status]}`, "success");
    onSaved(data.listing);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-[#0b1830]">{listing.businessName}</h3>
        <p className="mt-1 text-xs text-gray-500">
          {listing.business?.category?.name || "—"} ·{" "}
          {listing.publications?.map((p) => p.title).join(", ") || "—"}
        </p>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
        )}


        <div className="mt-4 space-y-1 rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-500">
          <p>Submitted by <span className="font-semibold text-[#0b1830]">{listing.submittedBy || "—"}</span></p>
          <p>Submitted {listing.submittedAt ? new Date(listing.submittedAt).toLocaleDateString() : "—"}</p>
          {listing.approvedBy && (
            <>
              <p>Approved by <span className="font-semibold text-[#0b1830]">{listing.approvedBy}</span></p>
              <p>Approved {listing.approvedAt ? new Date(listing.approvedAt).toLocaleDateString() : "—"}</p>
            </>
          )}
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold text-gray-600">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {status === "denied" && (
          <div className="mt-3">
            <label className="mb-1 block text-xs font-semibold text-gray-600">Reason</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="Let the business know why this was denied…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
            />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[#668b2f] px-5 py-2 text-sm font-bold text-white hover:bg-[#527323] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save status"}
          </button>
        </div>
      </div>
    </div>
  );
}


export default function DirectoryListingsPage() {
  const [listings,     setListings]     = useState([]);
  const [publications, setPublications] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [loading,       setLoading]     = useState(true);
  const [createOpen,    setCreateOpen]  = useState(false);
  const [editListing,   setEditListing] = useState(null);
  const [reviewListing, setReviewListing] = useState(null);

  const [categoryFilter,    setCategoryFilter]    = useState("");
  const [statusFilter,      setStatusFilter]      = useState("");
  const [publicationFilter, setPublicationFilter] = useState("");
  const [search,            setSearch]            = useState("");

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
  if (categoryFilter)    params.set("categoryId", categoryFilter);
  if (statusFilter)      params.set("status", statusFilter);
  if (publicationFilter) params.set("publicationId", publicationFilter);
  if (search)            params.set("search", search);
  params.set("page", page);
  params.set("pageSize", pageSize);

  const [listingsRes, pubsRes, destRes, catRes] = await Promise.all([
    fetch(`/api/admin/directory-listings?${params.toString()}`),
    fetch("/api/admin/publications"),
    fetch("/api/admin/destinations"),
    fetch("/api/admin/categories"),
  ]);
  const listingsData = await listingsRes.json();
  const pubsData      = await pubsRes.json();
  const destData       = await destRes.json();
  const catData        = await catRes.json();

  // Ignore this response if a newer request has been fired since.
  if (requestId !== requestIdRef.current) return;

  setListings(listingsData.listings || []);
  setTotalPages(listingsData.totalPages || 1);
  setTotalCount(listingsData.totalCount || 0);
  setPublications(pubsData.publications || []);
  setDestinations(destData.destinations || []);
  setCategories(catData.categories || []);
  setLoading(false);
}, [categoryFilter, statusFilter, publicationFilter, search, page]);

useEffect(() => {
  loadData();
}, [loadData]);

useEffect(() => {
  setPage(1);
}, [categoryFilter, statusFilter, publicationFilter, search]);


  async function deleteListing(listing) {
    if (!confirm(`Delete "${listing.businessName}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/admin/directory-listings/${listing.id}`, { method: "DELETE" });

    if (res.ok) {
      addToast(`"${listing.businessName}" deleted`, "info");
    } else {
      addToast("Failed to delete listing", "error");
    }

    loadData();
  }

  const filtered = listings;

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">


        <div className="mb-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0b1830]">
                Business directory
              </h1>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Searchable directory for smaller and service-based businesses, separate from full Digital Partner packages.
              </p>
            </div>

         
          </div>
        </div>

        {(totalCount > 0 || categoryFilter || statusFilter || publicationFilter || search) && (
          <div className="mb-5 flex flex-wrap gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business name…"
              className="h-10 w-full max-w-xs rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#668b2f] focus:outline-none"
            />
           
           
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#668b2f] focus:outline-none"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>

            
            <select
              value={publicationFilter}
              onChange={(e) => setPublicationFilter(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#668b2f] focus:outline-none"
            >
              <option value="">All publications</option>
              {publications.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        )}


        {loading ? (
          <div className="grid place-items-center py-20">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : totalCount === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="text-sm text-gray-400">No directory listings yet.</p>
           
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="text-sm text-gray-400">No listings match your filters.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <th className="px-4 py-3">Business</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Publication</th>
                    <th className="px-4 py-3 text-center">Views</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="max-w-[220px] px-4 py-4">
                        <p className="truncate font-semibold text-[#0b1830]">{listing.businessName}</p>
                        <p className="mt-0.5 truncate text-xs text-gray-400">
                          {listing.telephone || listing.website || "—"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-gray-500">
                        {listing.business?.category?.name || "—"}
                      </td>
                      <td className="max-w-[160px] truncate px-4 py-4 text-xs text-gray-500">
                        {listing.location || "—"}
                      </td>
                      <td className="max-w-[140px] truncate px-4 py-4 text-xs text-gray-500">
                        {listing.publications?.map((p) => p.title).join(", ") || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center text-sm font-bold text-[#0b1830]">
                        {listing._count?.events ?? 0}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center">
                        <button
                          onClick={() => setReviewListing(listing)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest hover:opacity-80 ${
                            STATUS_STYLES[listing.status] || "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {STATUS_LABELS[listing.status] || listing.status}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditListing(listing)}
                            title="Edit"
                            className="grid h-8 w-8 place-items-center rounded-lg bg-[#edf5df] text-[#527323] hover:bg-[#d6eabc]"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setReviewListing(listing)}
                            title="Review status"
                            className="h-8 rounded-lg border border-gray-200 px-2.5 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => deleteListing(listing)}
                            title="Delete"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages} · {totalCount} listing{totalCount === 1 ? "" : "s"}
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

      {createOpen && (
        <ListingModal
          publications={publications}
          destinations={destinations}
          categories={categories}
          onClose={() => setCreateOpen(false)}
          onSaved={(newListing) => {
            setCreateOpen(false);
            addToast(`"${newListing.businessName}" added`, "success");
            loadData();
          }}
        />
      )}

{editListing && (
        <ListingModal
          listing={editListing}
          publications={publications}
          destinations={destinations}
          categories={categories}
          onClose={() => setEditListing(null)}
          onSaved={(updated) => {
            setEditListing(null);
            addToast(`"${updated.businessName}" updated`, "success");
            loadData();
          }}
        />
      )}

   

      {reviewListing && (
        <ReviewModal
          listing={reviewListing}
          addToast={addToast}
          onClose={() => setReviewListing(null)}
          onSaved={() => {
            setReviewListing(null);
            loadData();
          }}
        />
      )}


      <Toast toasts={toasts} removeToast={removeToast} />
    </main>
  );
}