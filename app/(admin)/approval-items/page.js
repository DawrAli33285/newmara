"use client";

import { useState, useEffect, useCallback, useMemo } from "react";


const STAGES = [
  { key: "submitted", label: "Submitted" },
  { key: "approved",  label: "Approved" },
  { key: "expired",   label: "Rejected" },
];



const STAGE_STYLES = {
  submitted: "bg-[#eef2fb] text-[#3355a8]",
  approved:  "bg-[#edf5df] text-[#527323]",
 
  expired:   "bg-red-50 text-red-600",
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



function ItemDrawer({ item, onClose, onAdvance, onReject, advancing }) {
  if (!item) return null;

  const stageIndex = STAGES.findIndex((s) => s.key === item.stage);
  const nextStage = STAGES[stageIndex + 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STAGE_STYLES[item.stage]}`}>
              {STAGES.find((s) => s.key === item.stage)?.label || item.stage}
            </span>
            <h3 className="mt-2 text-lg font-bold text-[#0b1830]">{item.title}</h3>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 space-y-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Business</p>
            <p className="mt-1 text-[#0b1830]">{item.businessName || "—"}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Content type</p>
            <p className="mt-1 text-[#0b1830]">{item.contentType || "—"}</p>
          </div>

          {item.summary && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Summary of changes</p>
              <p className="mt-1 whitespace-pre-wrap leading-6 text-[#0b1830]">{item.summary}</p>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">History</p>
            <div className="mt-2 space-y-1.5 text-xs text-gray-600">
              <p>Submitted by: {item.submittedBy || "—"}</p>
              <p>Submitted: {item.submittedAt ? new Date(item.submittedAt).toLocaleString("en-IE") : "—"}</p>
              <p>Reviewed by: {item.reviewedBy || "—"}</p>
              
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
        

        {["submitted", "approved"].includes(item.stage) && (
  <button
    onClick={() => onReject(item)}
    disabled={advancing}
    className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
  >
    Reject
  </button>
)}
        </div>
      </div>
    </div>
  );
}



function ItemCard({ item, onOpen }) {
  return (
    <button
      onClick={() => onOpen(item)}
      className="w-full rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm hover:border-[#668b2f]"
    >
      <p className="truncate text-sm font-semibold text-[#0b1830]">{item.title}</p>
      <p className="mt-0.5 truncate text-xs text-gray-400">{item.businessName || "—"}</p>
      <p className="mt-2 text-[10px] text-gray-400">
        {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString("en-IE", { day: "2-digit", month: "short" }) : "—"}
      </p>
    </button>
  );
}



export default function ApprovalWorkflowPage() {
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState(null);
  const [advancing, setAdvancing] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/approval-items");
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((i) => `${i.title} ${i.businessName || ""}`.toLowerCase().includes(q));
  }, [items, search]);

  const byStage = useMemo(() => {
    const grouped = {};
    STAGES.forEach((s) => (grouped[s.key] = []));
    filtered.forEach((i) => {
      if (grouped[i.stage]) grouped[i.stage].push(i);
    });
    return grouped;
  }, [filtered]);

  async function handleAdvance(item, nextStage) {
    setAdvancing(true);
    const res = await fetch(`/api/admin/approval-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: nextStage }),
    });
    const data = await res.json();
    setAdvancing(false);

    if (!res.ok) {
      addToast(data.error || "Update failed", "error");
      return;
    }

    addToast(`"${item.title}" moved to ${STAGES.find((s) => s.key === nextStage)?.label}`, "success");
    setSelected(null);
    loadData();
  }

  async function handleReject(item) {
    await handleAdvance(item, "expired");
  }


  return (
    <main className="min-h-screen bg-[#f7f8fa] p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

      
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0b1830]">Approval Workflow</h1>
          
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, business…"
            className="h-10 w-56 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#668b2f] focus:outline-none"
          />
        </div>

     
        {loading ? (
          <div className="grid place-items-center py-20">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="text-sm text-gray-400">Nothing in the workflow yet.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map((stage) => (
              <div key={stage.key} className="w-64 shrink-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STAGE_STYLES[stage.key]}`}>
                    {stage.label}
                  </span>
                  <span className="text-xs text-gray-400">{byStage[stage.key].length}</span>
                </div>

                <div className="flex min-h-[80px] flex-col gap-2 rounded-2xl bg-gray-100/60 p-2">
                  {byStage[stage.key].length === 0 ? (
                    <p className="px-2 py-4 text-center text-xs text-gray-400">Empty</p>
                  ) : (
                    byStage[stage.key].map((item) => (
                      <ItemCard key={item.id} item={item} onOpen={setSelected} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ItemDrawer
        item={selected}
        onClose={() => setSelected(null)}
        onAdvance={handleAdvance}
        onReject={handleReject}
        advancing={advancing}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </main>
  );
}