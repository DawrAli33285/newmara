"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const STATUS_TABS = [
  { key: "pending",  label: "Pending"  },
  { key: "approved", label: "Approved" },
  { key: "denied",   label: "Rejected" },
];

// function ChangesDiff({ changes }) {
//   if (!changes || Object.keys(changes).length === 0) {
//     return <p className="text-xs text-gray-400">No changes recorded.</p>;
//   }

//   return (
//     <div className="space-y-2">
//       {Object.entries(changes).map(([field, value]) => (
//         <div key={field} className="rounded-lg bg-[#f7f8fa] px-3 py-2">
//           <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
//             {field}
//           </p>
//           <p className="text-xs text-[#0b1830] break-words">
//             {Array.isArray(value)
//               ? value.join(", ") || "—"
//               : typeof value === "object"
//               ? JSON.stringify(value)
//               : String(value) || "—"}
//           </p>
//         </div>
//       ))}
//     </div>
//   );
// }
function ChangesDiff({ changes }) {
  const entries = Object.entries(changes || {}).filter(
    ([field, value]) => value !== "" && value !== null && field !== "category"
  );

  if (entries.length === 0) {
    return <p className="text-xs text-gray-400">No changes recorded.</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map(([field, value]) => (
        <div key={field} className="rounded-lg bg-[#f7f8fa] px-3 py-2">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {field}
          </p>
          <p className="text-xs text-[#0b1830] break-words">
            {Array.isArray(value)
              ? value.join(", ") || "—"
              : typeof value === "object"
              ? JSON.stringify(value)
              : String(value) || "—"}
          </p>
        </div>
      ))}
    </div>
  );
}

function RejectModal({ edit, onClose, onRejected }) {
  const [reason, setReason]   = useState("");
  const [saving, setSaving]   = useState(false);
  const [error,  setError]    = useState("");


  async function handleReject() {
    if (!reason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/edits/${edit.id}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectionReason: reason, type: edit.type }),
    });
    setSaving(false);
    if (res.ok) {
      onRejected();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-[#0b1830]">Reject changes</h3>
        <p className="mt-1 text-xs text-gray-500">
          Provide a reason so the business knows what to fix.
        </p>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="e.g. Logo URL is broken, please re-upload..."
          className="mt-4 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
        />

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={saving}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {saving ? "Rejecting…" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}


function StatusBadge({ status }) {
  const map = {
    pending:   { label: "Pending",  bg: "bg-[#fff4d6]", text: "text-[#9a6a00]" },
    submitted: { label: "Pending",  bg: "bg-[#fff4d6]", text: "text-[#9a6a00]" },
    approved:  { label: "Approved", bg: "bg-[#edf5df]", text: "text-[#527323]" },
    denied:    { label: "Rejected", bg: "bg-red-50",    text: "text-red-600"   },
  };
  const s = map[status] ?? { label: status, bg: "bg-gray-100", text: "text-gray-500" };
  return (
    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function EditCard({ edit, onActionDone }) {
  const [approving,   setApproving]   = useState(false);
  const [rejectOpen,  setRejectOpen]  = useState(false);
  const [error,       setError]       = useState("");

  const isDirectoryEdit = edit.type === "directory_listing_edit";
  const business = isDirectoryEdit
    ? edit.directoryListing?.business
    : edit.businessProfile?.business;


  async function handleApprove() {
    setApproving(true);
    setError("");
    const res = await fetch(`/api/admin/edits/${edit.id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: edit.type }),
    });
    setApproving(false);
    if (res.ok) {
      onActionDone();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
    }
  }
  
  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
       
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#edf5df] text-base font-bold text-[#668b2f]">
              {business?.businessName?.slice(0, 1) || "?"}
            </div>
            <div>
              <p className="text-sm font-bold text-[#0b1830]">
                {business?.businessName || "Unknown business"}
              </p>
              <p className="text-xs text-gray-400">{business?.email}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <StatusBadge status={edit.status} />
            <span className="text-[10px] text-gray-400">
              {new Date(edit.submittedAt).toLocaleDateString("en-IE", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </span>
          </div>
        </div>

      
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Category
        </p>
        <p className="mb-4 text-xs font-semibold text-[#0b1830]">
        {business?.category?.name || "—"}
        </p>

      
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Requested changes
        </p>
        <ChangesDiff changes={edit.changes} />

       
        {edit.status === "denied" && edit.rejectionReason && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
              Rejection reason
            </p>
            <p className="mt-1 text-xs text-red-700">{edit.rejectionReason}</p>
          </div>
        )}

       
        {edit.reviewedBy && (
          <p className="mt-3 text-[10px] text-gray-400">
            Reviewed by {edit.reviewedBy} ·{" "}
            {new Date(edit.reviewedAt).toLocaleDateString("en-IE", {
              day: "2-digit", month: "short", year: "numeric",
            })}
          </p>
        )}

        
        {error && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

       
        {(edit.status === "pending" || edit.status === "submitted") && (
          <div className="mt-5 flex gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={handleApprove}
              disabled={approving}
              className="flex-1 rounded-xl bg-[#668b2f] py-2.5 text-sm font-bold text-white transition hover:bg-[#527323] disabled:opacity-60"
            >
              {approving ? "Approving…" : "✓ Approve"}
            </button>
            <button
              onClick={() => setRejectOpen(true)}
              className="flex-1 rounded-xl border border-red-200 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              ✕ Reject
            </button>
          </div>
        )}
      </div>

      {rejectOpen && (
        <RejectModal
          edit={edit}
          onClose={() => setRejectOpen(false)}
          onRejected={() => {
            setRejectOpen(false);
            onActionDone();
          }}
        />
      )}
    </>
  );
}


export default function ProfileEditsPage() {
    const [activeTab,   setActiveTab]   = useState("pending");
    const [edits,       setEdits]       = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [page,        setPage]        = useState(1);
    const [totalPages,  setTotalPages]  = useState(1);
    const [total,       setTotal]       = useState(0);
  
  
   const loadEdits = useCallback(async () => {
    setLoading(true);
    const res  = await fetch(`/api/admin/pending-edits?status=${activeTab}&page=${page}`);
    const data = await res.json();
    const relevantEdits = (data.queue || []).filter(
      (item) => item.type === "profile_edit" || item.type === "directory_listing_edit"
    );
    setEdits(relevantEdits);

    setTotalPages(data.totalPages || 1);
    setTotal(data.count || 0);
    setLoading(false);
  }, [activeTab, page]);
  
    useEffect(() => {
      loadEdits();
    }, [loadEdits]);
  
    
    useEffect(() => {
      setPage(1);
    }, [activeTab]);

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-6 md:p-8">
      <div className="mx-auto max-w-5xl">

       
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#668b2f]">
            Admin approval
          </p>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0b1830]">
                Profile edit requests
              </h1>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Review, approve or reject business profile changes before they go live.
              </p>
            </div>
            
          </div>
        </div>

   
        <div className="mb-6 flex gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? "bg-[#0b1830] text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      
        {loading ? (
          <div className="grid place-items-center py-20">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : edits.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="text-sm text-gray-400">
              No {activeTab} edits found.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {edits.map((edit) => (
              <EditCard key={edit.id} edit={edit} onActionDone={loadEdits} />
            ))}
          </div>
        )}
         
           {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
              >
                ← Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}