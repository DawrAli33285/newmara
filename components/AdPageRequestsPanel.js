
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

export default function AdPageRequestsPanel({ issueId, initialPendingCount = 0 }) {
  const [expanded, setExpanded] = useState(initialPendingCount > 0);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actioningId, setActioningId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  async function load() {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`/api/admin/issues/${issueId}/ad-page-requests`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load requests.");
      setRequests(data.requests || []);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (expanded) load();
    
  }, [expanded, issueId]);

  const pending = requests.filter((r) => r.status === "pending");
  const reviewed = requests.filter((r) => r.status !== "pending");
  const pendingCount = expanded ? pending.length : initialPendingCount;

  async function handleApprove(requestId) {
    setActioningId(requestId);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/ad-page-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed.");
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(requestId) {
    setActioningId(requestId);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/ad-page-requests/${requestId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: rejectionReason.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rejection failed.");
      setRejectingId(null);
      setRejectionReason("");
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            Ad page requests
          </h2>
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
              {pendingCount} pending
            </span>
          )}
        </div>
        <span className="text-sm text-gray-400">{expanded ? "Hide" : "Review"}</span>
      </button>

      {expanded && (
        <div className="mt-5 space-y-6">
          {actionError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {actionError}
            </div>
          )}
          {loadError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : (
            <>
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                  Pending ({pending.length})
                </h3>
                {pending.length === 0 ? (
                  <p className="text-sm text-gray-400">No pending requests.</p>
                ) : (
                  <ul className="space-y-3">
                    {pending.map((r) => (
                      <li
                        key={r.id}
                        className="rounded-lg border border-amber-200 bg-amber-50 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">
                              {r.advertiser?.advertiserName || "Unknown advertiser"}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-600">
                              {r.linkType === "video" ? "▶ Video" : "🔗 Link"}
                              {r.label ? ` — ${r.label}` : ""}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 truncate max-w-md">
                              {r.linkUrl}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {r.insertPosition === "before" ? "Before" : "After"} page{" "}
                              {r.relativeToPageNumber}
                            </p>
                            <a
                              href={r.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-block text-xs font-semibold text-[#1c3664] hover:underline"
                            >
                              View submitted PDF page →
                            </a>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(r.id)}
                                disabled={actioningId === r.id}
                                className="rounded-lg bg-[#2f7d1b] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#25640f] disabled:opacity-50"
                              >
                                {actioningId === r.id ? "Approving…" : "Approve"}
                              </button>
                              <button
                                onClick={() =>
                                  setRejectingId(rejectingId === r.id ? null : r.id)
                                }
                                disabled={actioningId === r.id}
                                className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>

                        {rejectingId === r.id && (
                          <div className="mt-3 flex gap-2">
                            <input
                              type="text"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Reason (optional)"
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs"
                            />
                            <button
                              onClick={() => handleReject(r.id)}
                              disabled={actioningId === r.id}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {actioningId === r.id ? "Rejecting…" : "Confirm reject"}
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {reviewed.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Reviewed
                  </h3>
                  <ul className="space-y-2">
                    {reviewed.map((r) => (
                      <li
                        key={r.id}
                        className={`rounded-lg border px-3 py-2.5 text-sm ${STATUS_COLOR[r.status]}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">
                            {r.advertiser?.advertiserName || "Unknown"} —{" "}
                            {r.linkType === "video" ? "▶ Video" : "🔗 Link"}
                          </p>
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            {STATUS_LABEL[r.status]}
                          </span>
                        </div>
                        {r.status === "approved" && r.resultingPageNumber && (
                          <p className="mt-1 text-xs opacity-80">
                            Now on page {r.resultingPageNumber}
                          </p>
                        )}
                        {r.status === "rejected" && r.rejectionReason && (
                          <p className="mt-1 text-xs opacity-80">{r.rejectionReason}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}