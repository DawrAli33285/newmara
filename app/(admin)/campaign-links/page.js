"use client";

import { useState, useEffect, useCallback } from "react";

const CHANNELS = [
  "Airport",
  "Hotel",
  "Tourism Venue",
  "Facebook",
  "Instagram",
  "Email",
  "Advertiser Campaign",
  "Other",
];



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



function CreateModal({ publications, onClose, onCreated }) {
  const [form, setForm] = useState({
    label: "",
    channel: "",
    destinationUrl: "",
    publicationId: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/campaign-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    onCreated(data.link);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-[#0b1830]">Create campaign link</h3>
        <p className="mt-1 text-xs text-gray-500">Generates a unique trackable link and QR code.</p>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Label</label>
            <input
              value={form.label}
              onChange={(e) => update("label", e.target.value)}
              placeholder="e.g. Dublin Airport Stand — Aug 2026"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Channel</label>
            <select
              value={form.channel}
              onChange={(e) => update("channel", e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
            >
              <option value="">Select channel…</option>
              {CHANNELS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Destination URL</label>
            <input
              value={form.destinationUrl}
              onChange={(e) => update("destinationUrl", e.target.value)}
              placeholder="https://maramedia.ie/publications/take-off"
              required
              type="url"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Publication (optional)</label>
            <select
              value={form.publicationId}
              onChange={(e) => update("publicationId", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
            >
              <option value="">No specific publication</option>
              {publications.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
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
              {saving ? "Creating…" : "Create link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



function QRModal({ link, baseUrl, onClose, addToast }) {
  const trackUrl = `${baseUrl}/api/r/${link.code}`;
  const qrUrl    = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(trackUrl)}`;
  const isActive = link.isActive;

  function copyToClipboard() {
    navigator.clipboard.writeText(trackUrl);
    addToast("Link copied to clipboard", "success");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
        <h3 className="text-lg font-bold text-[#0b1830]">{link.label}</h3>
        <p className="mt-1 text-xs text-gray-500">
          {link.channel} · {link.publication?.title || "No publication"}
        </p>

       
        {!isActive && (
          <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 font-semibold">
            This link is currently disabled. Enable it before sharing.
          </div>
        )}

        <div className={`mt-5 flex justify-center ${!isActive ? "opacity-30 grayscale" : ""}`}>
          <img
            src={qrUrl}
            alt="QR Code"
            className="h-48 w-48 rounded-xl border border-gray-200"
          />
        </div>

     
        <div className="mt-4 rounded-xl bg-gray-50 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Trackable link</p>
          <p className="mt-1 break-all text-xs text-[#0b1830]">{trackUrl}</p>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={copyToClipboard}
            disabled={!isActive}
            title={!isActive ? "Enable this link before copying" : ""}
            className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Copy link
          </button>

          {isActive ? (
            <a
              href={qrUrl}
              download={`qr-${link.code}.png`}
              onClick={() => addToast("QR code downloaded", "success")}
              className="flex-1 rounded-xl bg-[#668b2f] py-2 text-sm font-bold text-white hover:bg-[#527323]"
            >
              Download QR
            </a>
          ) : (
            <button
              disabled
              title="Enable this link before downloading"
              className="flex-1 rounded-xl bg-[#668b2f] py-2 text-sm font-bold text-white opacity-40 cursor-not-allowed"
            >
              Download QR
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}



export default function CampaignLinksPage() {
  const [links,        setLinks]        = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [createOpen,   setCreateOpen]   = useState(false);
  const [qrLink,       setQrLink]       = useState(null);
  const [baseUrl,      setBaseUrl]      = useState("");
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalCount,   setTotalCount]   = useState(0);
  const pageSize = 10;

  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("pageSize", pageSize);

    const [linksRes, pubsRes] = await Promise.all([
      fetch(`/api/admin/campaign-links?${params.toString()}`),
      fetch("/api/admin/publications"),
    ]);
    const linksData = await linksRes.json();
    const pubsData  = await pubsRes.json();
    setLinks(linksData.links || []);
    setTotalPages(linksData.totalPages || 1);
    setTotalCount(linksData.totalCount || 0);
    setPublications(pubsData.publications || []);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function toggleActive(link) {
    const res = await fetch(`/api/admin/campaign-links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !link.isActive }),
    });

    if (res.ok) {
      addToast(
        link.isActive ? `"${link.label}" disabled` : `"${link.label}" enabled`,
        "success"
      );
    } else {
      addToast("Failed to update link status", "error");
    }

    loadData();
  }

  async function deleteLink(link) {
    if (!confirm(`Delete "${link.label}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/admin/campaign-links/${link.id}`, { method: "DELETE" });

    if (res.ok) {
      addToast(`"${link.label}" deleted`, "info");
    } else {
      addToast("Failed to delete link", "error");
    }

    loadData();
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">

      
        <div className="mb-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0b1830]">
                QR codes & campaign links
              </h1>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Generate trackable links and QR codes for airports, hotels, social media and advertiser campaigns.
              </p>
            </div>

            {links.length > 0 && (
              <button
                onClick={() => setCreateOpen(true)}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-[#668b2f] px-5 text-sm font-bold text-white hover:bg-[#527323]"
              >
                + New campaign link
              </button>
            )}
          </div>
        </div>

    
        {loading ? (
          <div className="grid place-items-center py-20">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : links.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="text-sm text-gray-400">No campaign links yet.</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-4 rounded-xl bg-[#668b2f] px-4 py-2 text-sm font-bold text-white hover:bg-[#527323]"
            >
              Create your first link
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <th className="px-4 py-3">Label</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Publication</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3 text-center">Scans</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {links.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-50">
                      <td className="max-w-[200px] px-4 py-4">
                        <p className="truncate font-semibold text-[#0b1830]">{link.label}</p>
                        <p className="mt-0.5 truncate text-xs text-gray-400">{link.destinationUrl}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-gray-500">{link.channel}</td>
                      <td className="max-w-[140px] truncate px-4 py-4 text-xs text-gray-500">
                        {link.publication?.title || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <code className="rounded bg-gray-100 px-2 py-1 text-xs text-[#0b1830]">
                          {link.code}
                        </code>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center text-sm font-bold text-[#0b1830]">
                        {link._count?.events ?? 0}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                            link.isActive
                              ? "bg-[#edf5df] text-[#527323]"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {link.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setQrLink(link)}
                            title="QR / Link"
                            className="grid h-8 w-8 place-items-center rounded-lg bg-[#edf5df] text-[#527323] hover:bg-[#d6eabc]"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                              <rect x="3" y="3" width="7" height="7" rx="1" />
                              <rect x="14" y="3" width="7" height="7" rx="1" />
                              <rect x="3" y="14" width="7" height="7" rx="1" />
                              <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v.01" />
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleActive(link)}
                            title={link.isActive ? "Disable" : "Enable"}
                            className="h-8 rounded-lg border border-gray-200 px-2.5 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                          >
                            {link.isActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => deleteLink(link)}
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

               {!loading && links.length > 0 && (
                 <div className="mt-4 flex items-center justify-between">
                   <p className="text-xs text-gray-500">
                     Page {page} of {totalPages} · {totalCount} link{totalCount === 1 ? "" : "s"}
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
        <CreateModal
          publications={publications}
          onClose={() => setCreateOpen(false)}
          onCreated={(newLink) => {
            setCreateOpen(false);
            addToast(`"${newLink.label}" created`, "success");
            loadData();
          }}
        />
      )}

      {qrLink && (
        <QRModal
          link={qrLink}
          baseUrl={baseUrl}
          onClose={() => setQrLink(null)}
          addToast={addToast}
        />
      )}

      <Toast toasts={toasts} removeToast={removeToast} />
    </main>
  );
}