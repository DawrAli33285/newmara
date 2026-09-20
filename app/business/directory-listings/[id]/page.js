"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditDirectoryListingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [listing, setListing] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    category: "",
    location: "",
    telephone: "",
    website: "",
  });

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/business/directory-listings/${id}`);
      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setListing(data.listing);
      setCategories(data.categories || []);
      setForm({
        businessName: data.listing.businessName || "",
        category: data.listing.category || "",
        location: data.listing.location || "",
        telephone: data.listing.telephone || "",
        website: data.listing.website || "",
      });
      setLoading(false);
    }
    if (id) load();
  }, [id]);


  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/business/directory-listings/${id}`, {
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

    setSubmitted(true);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl p-5 sm:p-8">
        <p className="text-sm text-slate-500">Loading…</p>
      </main>
    );
  }

  if (notFound || !listing) {
    return (
      <main className="mx-auto max-w-2xl p-5 sm:p-8">
        <p className="text-sm text-slate-500">Listing not found.</p>
      </main>
    );
  }

  const hasPendingEdit = listing.edits?.length > 0;

  if (submitted) {
    return (
      <main className="mx-auto max-w-2xl p-5 sm:p-8">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#edf6e5] text-2xl font-bold text-[#2f7d1b]">
            ✓
          </div>
          <h1 className="mt-5 text-xl font-bold text-[#0b1830]">Changes submitted</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your update has been sent for admin review. It will go live once approved.
          </p>
          
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-5 sm:p-8">
      

      <h1 className="mt-3 text-2xl font-bold text-[#0b1830]">Edit listing</h1>
      <p className="mt-1 text-sm text-slate-500">
        Changes are submitted for admin review before they go live.
      </p>

      {hasPendingEdit && (
        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
          You have a pending edit awaiting review. Submitting again will replace it.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Business name</label>
          <input
            required
            value={form.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Category</label>
          <select
            required
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
          >
            <option value="" disabled>Select a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Location</label>
          <input
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Telephone</label>
            <input
              value={form.telephone}
              onChange={(e) => update("telephone", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Website</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex min-h-11 w-full items-center justify-center rounded-lg bg-[#2f7d1b] text-sm font-bold text-white hover:bg-[#246515] disabled:opacity-60"
        >
          {saving ? "Submitting…" : "Submit for review"}
        </button>
      </form>
    </main>
  );
}