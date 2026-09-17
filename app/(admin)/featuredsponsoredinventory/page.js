"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

const SLOT_TYPES = {
  featured_business:   "Featured Business",
  featured_offer:      "Featured Offer",
  destination_partner: "Destination Partner",
  category_sponsor:    "Category Sponsor",
  homepage_feature:    "Homepage Feature",
  sponsored_article:   "Sponsored Article",
  video_feature:       "Video Feature",
};

const STATUS_STYLES = {
  active:   "bg-[#edf5df] text-[#527323]",
  upcoming: "bg-[#eef2fb] text-[#3355a8]",
  expired:  "bg-gray-100 text-gray-500",
};

function statusOf(slot) {
  const now = new Date();
  if (slot.endDate && new Date(slot.endDate) < now) return "expired";
  if (slot.startDate && new Date(slot.startDate) > now) return "upcoming";
  return "active";
}



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

const inputCls =
  "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#668b2f] focus:outline-none";

function Field({ label, children }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      {children}
    </div>
  );
}



function SlotDrawer({ slot, publications, onClose, onSave, saving }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (slot) {
      setForm({
        slotType: slot.slotType || "featured_business",
        businessName: slot.businessName || "",
        title: slot.title || "",
        publicationId: slot.publicationId || "",
        startDate: slot.startDate ? slot.startDate.slice(0, 10) : "",
        endDate: slot.endDate ? slot.endDate.slice(0, 10) : "",
      });
    }
  }, [slot]);

  if (!slot || !form) return null;

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-[#0b1830]">
            {slot.id ? "Edit Slot" : "New Featured Slot"}
          </h3>
          <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <Field label="Slot type">
            <select className={inputCls} value={form.slotType} onChange={(e) => set("slotType", e.target.value)}>
              {Object.entries(SLOT_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>

          <Field label="Title / headline">
            <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>

          <Field label="Business">
            <input className={inputCls} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
          </Field>

          <Field label="Publication">
            <select className={inputCls} value={form.publicationId} onChange={(e) => set("publicationId", e.target.value)}>
              <option value="">All publications</option>
              {publications.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date">
              <input type="date" className={inputCls} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </Field>
            <Field label="End date">
              <input type="date" className={inputCls} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
            </Field>
          </div>
        </div>

        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className="mt-6 w-full rounded-xl bg-[#668b2f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#527323] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save slot"}
        </button>
      </div>
    </div>
  );
}



function SlotRow({ slot, onOpen }) {
  const status = statusOf(slot);
  return (
    <button
      onClick={() => onOpen(slot)}
      className="flex w-full items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_STYLES[status]}`}>
          {status}
        </span>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#0b1830]">{slot.title || slot.businessName}</p>
          <p className="truncate text-xs text-gray-400">
            {SLOT_TYPES[slot.slotType] || slot.slotType} · {slot.businessName || "—"}
          </p>
        </div>
      </div>

      <span className="shrink-0 text-xs text-gray-400">
        {slot.endDate ? `until ${new Date(slot.endDate).toLocaleDateString("en-IE", { day: "2-digit", month: "short" })}` : "no end date"}
      </span>
    </button>
  );
}



export default function FeaturedInventoryPage() {
  const [slots,        setSlots]        = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading,       setLoading]     = useState(true);
  const [typeFilter,    setTypeFilter]  = useState("");
  const [search,        setSearch]      = useState("");
  const [selected,      setSelected]    = useState(null);
  const [saving,        setSaving]      = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [slotsRes, pubsRes] = await Promise.all([
      fetch("/api/admin/featured-slots"),
      fetch("/api/admin/publications"),
    ]);
    const slotsData = await slotsRes.json();
    const pubsData = await pubsRes.json();
    setSlots(slotsData.slots || []);
    setPublications(pubsData.publications || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    return slots.filter((s) => {
      if (typeFilter && s.slotType !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${s.title || ""} ${s.businessName || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [slots, search, typeFilter]);

  async function handleSave(form) {
    setSaving(true);
    const isNew = !selected.id;
    const res = await fetch(
      isNew ? "/api/admin/featured-slots" : `/api/admin/featured-slots/${selected.id}`,
      {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      addToast(data.error || "Save failed", "error");
      return;
    }

    addToast(`Saved "${form.title || form.businessName}"`, "success");
    setSelected(null);
    loadData();
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">

       
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0b1830]">Featured & Sponsored Inventory</h1>
           
          </div>

          <button
            onClick={() => setSelected({})}
            className="h-10 shrink-0 rounded-xl bg-[#668b2f] px-4 text-sm font-bold text-white hover:bg-[#527323]"
          >
            + New slot
          </button>
        </div>

      
        {slots.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, business…"
              className="h-10 w-56 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#668b2f] focus:outline-none"
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#668b2f] focus:outline-none"
            >
              <option value="">All slot types</option>
              {Object.entries(SLOT_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}

       
        {loading ? (
          <div className="grid place-items-center py-20">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="text-sm text-gray-400">No featured slots yet.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="text-sm text-gray-400">No slots match these filters.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {filtered.map((slot) => (
              <SlotRow key={slot.id} slot={slot} onOpen={setSelected} />
            ))}
          </div>
        )}
      </div>

      <SlotDrawer
        slot={selected}
        publications={publications}
        onClose={() => setSelected(null)}
        onSave={handleSave}
        saving={saving}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </main>
  );
}