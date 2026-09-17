"use client";

import { useState, useEffect, useCallback, useMemo } from "react";



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



function Field({ label, children }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      {children}
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#668b2f] focus:outline-none";
const textareaCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none";



function ProfileDrawer({ profile, publications, destinations, onClose, onSave, saving }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (profile) {
      setForm({
        businessName: profile.businessName || "",
        logoUrl: profile.logoUrl || "",
        description: profile.description || "",
        location: profile.location || "",
        website: profile.website || "",
        telephone: profile.telephone || "",
        mapUrl: profile.mapUrl || "",
        socialLinks: profile.socialLinks || "",
        promoVideoUrl: profile.promoVideoUrl || "",
        ctaText: profile.ctaText || "",
        ctaUrl: profile.ctaUrl || "",
        publicationIds: profile.publicationIds || [],
        destinationId: profile.destinationId || "",
      });
    }
  }, [profile]);

  if (!profile || !form) return null;

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function togglePublication(id) {
    setForm((prev) => ({
      ...prev,
      publicationIds: prev.publicationIds.includes(id)
        ? prev.publicationIds.filter((p) => p !== id)
        : [...prev.publicationIds, id],
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-[#0b1830]">
            {profile.id ? "Edit Business Profile" : "New Business Profile"}
          </h3>
          <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <Field label="Business name">
            <input className={inputCls} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
          </Field>

          <Field label="Logo URL">
            <input className={inputCls} value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} />
          </Field>

          <Field label="Description">
            <textarea rows={3} className={textareaCls} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>

          <Field label="Location">
            <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} />
          </Field>

          <Field label="Destination">
            <select className={inputCls} value={form.destinationId} onChange={(e) => set("destinationId", e.target.value)}>
              <option value="">No destination tag</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {"—".repeat(d.level === "category" ? 2 : d.level === "destination" ? 1 : 0)} {d.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Website">
            <input className={inputCls} value={form.website} onChange={(e) => set("website", e.target.value)} />
          </Field>

          <Field label="Telephone">
            <input className={inputCls} value={form.telephone} onChange={(e) => set("telephone", e.target.value)} />
          </Field>

          <Field label="Map link">
            <input className={inputCls} value={form.mapUrl} onChange={(e) => set("mapUrl", e.target.value)} />
          </Field>

          <Field label="Social media links">
            <textarea rows={2} className={textareaCls} placeholder="One per line" value={form.socialLinks} onChange={(e) => set("socialLinks", e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="CTA text">
              <input className={inputCls} value={form.ctaText} onChange={(e) => set("ctaText", e.target.value)} />
            </Field>
            <Field label="CTA URL">
              <input className={inputCls} value={form.ctaUrl} onChange={(e) => set("ctaUrl", e.target.value)} />
            </Field>
          </div>

          <Field label="Promotional video URL">
            <input className={inputCls} value={form.promoVideoUrl} onChange={(e) => set("promoVideoUrl", e.target.value)} />
          </Field>

          <Field label="Relevant publication(s)">
            <div className="flex flex-wrap gap-2">
              {publications.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePublication(p.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    form.publicationIds.includes(p.id)
                      ? "bg-[#668b2f] text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className="mt-6 w-full rounded-xl bg-[#668b2f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#527323] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </div>
  );
}



function ProfileRow({ profile, onOpen }) {
  return (
    <button
      onClick={() => onOpen(profile)}
      className="flex w-full items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50"
    >
      <div className="flex min-w-0 items-center gap-3">
        {profile.logoUrl ? (
          <img src={profile.logoUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gray-100 text-xs font-bold text-gray-400">
            {profile.businessName?.[0] || "?"}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#0b1830]">{profile.businessName}</p>
          <p className="truncate text-xs text-gray-400">
            {profile.destinationName || "No destination"} · {profile.location || "No location"}
          </p>
        </div>
      </div>

      <span className="shrink-0 text-xs text-gray-400">
        {profile.publicationIds?.length || 0} publication{profile.publicationIds?.length === 1 ? "" : "s"}
      </span>
    </button>
  );
}



export default function BusinessProfilesPage() {
  const [profiles,      setProfiles]      = useState([]);
  const [publications,  setPublications]  = useState([]);
  const [destinations,  setDestinations]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [selected,      setSelected]      = useState(null);
  const [saving,        setSaving]        = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [profRes, pubsRes, destRes] = await Promise.all([
      fetch("/api/admin/business-profiles"),
      fetch("/api/admin/publications"),
      fetch("/api/admin/destinations"),
    ]);
    const profData = await profRes.json();
    const pubsData = await pubsRes.json();
    const destData = await destRes.json();
    setProfiles(profData.profiles || []);
    setPublications(pubsData.publications || []);
    setDestinations(destData.destinations || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      if (destinationFilter && p.destinationId !== destinationFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${p.businessName} ${p.location || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [profiles, search, destinationFilter]);

  async function handleSave(form) {
    setSaving(true);
    const isNew = !selected.id;
    const res = await fetch(
      isNew ? "/api/admin/business-profiles" : `/api/admin/business-profiles/${selected.id}`,
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

    addToast(`Saved "${form.businessName}"`, "success");
    setSelected(null);
    loadData();
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">

       
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0b1830]">Business Profiles</h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Structured profile content for Digital Partners — logo, description, contact and media.
            </p>
          </div>

          <button
            onClick={() => setSelected({})}
            className="h-10 shrink-0 rounded-xl bg-[#668b2f] px-4 text-sm font-bold text-white hover:bg-[#527323]"
          >
            + New profile
          </button>
        </div>

        {profiles.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business, location…"
              className="h-10 w-56 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#668b2f] focus:outline-none"
            />

            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#668b2f] focus:outline-none"
            >
              <option value="">All destinations</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

      
        {loading ? (
          <div className="grid place-items-center py-20">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="text-sm text-gray-400">No business profiles yet.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="text-sm text-gray-400">No profiles match these filters.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {filtered.map((profile) => (
              <ProfileRow key={profile.id} profile={profile} onOpen={setSelected} />
            ))}
          </div>
        )}
      </div>

      <ProfileDrawer
        profile={selected}
        publications={publications}
        destinations={destinations}
        onClose={() => setSelected(null)}
        onSave={handleSave}
        saving={saving}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </main>
  );
}