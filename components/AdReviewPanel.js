"use client";

import { useEffect, useState } from "react";

const STATUS_LABEL = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_COLOR = {
  pending: "bg-amber-50 border-amber-200 text-amber-700",
  approved: "bg-emerald-50 border-emerald-200 text-emerald-700",
  rejected: "bg-red-50 border-red-200 text-red-700",
};

export default function AdReviewPanel({
  publicationId,
  publicationTitle,
  initialPendingCount = 0,
}) {
  const [open, setOpen] = useState(false);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingCount, setPendingCount] = useState(initialPendingCount);
  const [busyId, setBusyId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/publications/${publicationId}/ads?status=pending`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load ads.");
      setAds(data.ads || []);
      setPendingCount(data.ads?.length ?? 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) load();
    
  }, [open]);

  async function handleApprove(adId) {
    setBusyId(adId);
    setError("");
    try {
      const res = await fetch(`/api/admin/ads/${adId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not approve ad.");
      await load();
      window.location.reload(true)
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(adId) {
    setBusyId(adId);
    setError("");
    try {
      const res = await fetch(`/api/admin/ads/${adId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          rejectionReason: rejectionReason.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not reject ad.");
      setRejectingId(null);
      setRejectionReason("");
      await load();
      window.location.reload(true)
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            Ad submissions
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            Pending ads for {publicationTitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              {pendingCount} pending
            </span>
          )}
          <span className="text-gray-400">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="mt-5 space-y-3">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : ads.length === 0 ? (
            <p className="text-sm text-gray-400">No pending ads.</p>
          ) : (
            ads.map((ad) => (
              <div
                key={ad.id}
                className={`rounded-lg border p-4 ${STATUS_COLOR[ad.status] || "border-gray-200"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {ad.advertiser?.advertiserName || "Unknown advertiser"}
                    </p>
                    <p className="mt-0.5 text-xs opacity-80">
                      {ad.linkType === "video" ? "▶ Video" : "🔗 Link"}
                      {ad.label ? ` — ${ad.label}` : ""}
                    </p>
                    <a
                      href={ad.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block truncate text-xs underline"
                    >
                      {ad.linkUrl}
                    </a>
                    <a
                      href={ad.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs font-semibold underline"
                    >
                      View PDF{ad.pdfFileName ? ` (${ad.pdfFileName})` : ""}
                    </a>
                    <p className="mt-1 text-xs opacity-70">
                      ${(ad.priceCents / 100).toFixed(2)}
                    </p>
                  </div>

                  <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide">
                    {STATUS_LABEL[ad.status] || ad.status}
                  </span>
                </div>

                {rejectingId === ad.id ? (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Reason (optional)"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(ad.id)}
                        disabled={busyId === ad.id}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                      >
                        {busyId === ad.id ? "Rejecting…" : "Confirm reject"}
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectionReason("");
                        }}
                        disabled={busyId === ad.id}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleApprove(ad.id)}
                      disabled={busyId === ad.id}
                      className="rounded-lg bg-[#2f7d1b] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                    >
                      {busyId === ad.id ? "Approving…" : "Approve"}
                    </button>
                    <button
                      onClick={() => setRejectingId(ad.id)}
                      disabled={busyId === ad.id}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}