"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const STATUS_COLORS = {
  draft:        { bg: "bg-gray-100",    text: "text-gray-500"    },
  submitted:    { bg: "bg-blue-50",     text: "text-blue-600"    },
  mara_review:  { bg: "bg-purple-50",   text: "text-purple-600"  },
  approved:     { bg: "bg-yellow-50",   text: "text-yellow-600"  },
  live:         { bg: "bg-[#edf5df]",   text: "text-[#527323]"   },
  expired:      { bg: "bg-gray-100",    text: "text-gray-400"    },
  denied:       { bg: "bg-red-50",      text: "text-red-600"     },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] ?? { bg: "bg-gray-100", text: "text-gray-500" };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${s.bg} ${s.text}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function OfferModal({ offer, onClose, onSaved }) {
  const isEdit = Boolean(offer?.id);

  const [form, setForm] = useState({
    title:       offer?.title       || "",
    description: offer?.description || "",
    imageUrl:    offer?.imageUrl    || "",
    promoCode:   offer?.promoCode   || "",
    ctaText:     offer?.ctaText     || "",
    ctaUrl:      offer?.ctaUrl      || "",
    startDate:   offer?.startDate   ? offer.startDate.slice(0, 10) : "",
    expiryDate:  offer?.expiryDate  ? offer.expiryDate.slice(0, 10) : "",
    terms:       offer?.terms       || "",
    visibility:  offer?.visibility  || "public",
    publicationId: offer?.publicationId || "",
  });

  const [publications, setPublications] = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [uploading, setUploading] = useState(false);


  useEffect(() => {
    fetch("/api/admin/publications")
      .then((r) => r.json())
      .then((d) => setPublications(d.publications || []));
  }, []);

  
  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e, submitForReview = false) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = { ...form, submit: submitForReview };

    const res = await fetch(
      isEdit ? `/api/offers/${offer.id}` : "/api/offers",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    onSaved();
  }


  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
   
    setUploading(true);
    setError("");
   
    const fd = new FormData();
    fd.append("file", file);
   
    const res = await fetch("/api/business/offers/upload-image", {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    setUploading(false);
   
    if (!res.ok) {
      setError(data.error || "Image upload failed.");
      return;
    }
   
    update("imageUrl", data.url);
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold text-[#0b1830]">
            {isEdit ? "Edit offer" : "Create offer"}
          </h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100">✕</button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
        )}

        <form className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Publication *</label>
            <select
              value={form.publicationId}
              onChange={(e) => update("publicationId", e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
            >
              <option value="">Select publication…</option>
              {publications.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Offer title *</label>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
              placeholder="e.g. 10% off for readers"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
            />
          </div>

          
          <div className="rounded-xl border-2 border-dashed border-[#2f7d1b] bg-[#f7fbf3] p-4">
            <label className="mb-1 block text-xs font-bold text-[#2f7d1b]">
              🎟 Promo / discount code
            </label>
            <input
              value={form.promoCode}
              onChange={(e) => update("promoCode", e.target.value.toUpperCase())}
              placeholder="e.g. MARA10"
              className="w-full rounded-lg border border-[#2f7d1b] bg-white px-3 py-2 text-sm font-mono font-bold tracking-widest text-[#0b1830] focus:outline-none"
            />
            <p className="mt-1.5 text-[10px] text-[#668b2f]">
              Leave blank if no code is required. Codes are shown to readers on the offer card.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Start date *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Expiry date *</label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => update("expiryDate", e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">CTA text</label>
              <input
                value={form.ctaText}
                onChange={(e) => update("ctaText", e.target.value)}
                placeholder="e.g. Redeem offer"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">CTA URL</label>
              <input
                value={form.ctaUrl}
                onChange={(e) => update("ctaUrl", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
              />
            </div>
          </div>

          <div>
  <label className="mb-1 block text-xs font-semibold text-slate-600">Offer image</label>
 
  {form.imageUrl ? (
    <div className="relative mb-2 h-32 w-full overflow-hidden rounded-lg border border-slate-200">
      <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={() => update("imageUrl", "")}
        className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
      >
        ✕
      </button>
    </div>
  ) : (
    <label className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-sm text-slate-400 hover:border-[#2f7d1b] hover:text-[#2f7d1b]">
      {uploading ? "Uploading…" : "Click to select an image"}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={uploading}
        className="hidden"
      />
    </label>
  )}
</div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Terms & conditions</label>
            <textarea
              value={form.terms}
              onChange={(e) => update("terms", e.target.value)}
              rows={2}
              placeholder="e.g. Valid on weekdays only. Cannot be combined with other offers."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Visibility</label>
            <select
              value={form.visibility}
              onChange={(e) => update("visibility", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
            >
              <option value="public">Public — visible to all readers</option>
              <option value="registered">Registered — visible to logged-in readers</option>
              <option value="subscriber">Subscriber — visible to paid subscribers only</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
  type="button"
  disabled={saving || uploading}
  onClick={(e) => handleSubmit(e, false)}
  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
>
  Save draft
</button>
<button
  type="button"
  disabled={saving || uploading}
  onClick={(e) => handleSubmit(e, true)}
  className="flex-1 rounded-lg bg-[#2f7d1b] px-5 py-2 text-sm font-bold text-white hover:bg-[#246515] disabled:opacity-60"
>
  {saving ? "Submitting…" : "Submit for review"}
</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OffersPage() {
  const { data: session, status } = useSession();
  const [offers,     setOffers]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editOffer,  setEditOffer]  = useState(null);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/business/offers");
    const data = await res.json();
    setOffers(data.offers || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status !== "loading") loadOffers();
  }, [status, loadOffers]);

  function openCreate() {
    setEditOffer(null);
    setModalOpen(true);
  }

  function openEdit(offer) {
    setEditOffer(offer);
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#f7f8f6] p-6 md:p-8">
      <div className="mx-auto max-w-4xl">

       
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#2f7d1b]">
              Business portal
            </p>
            <h1 className="text-3xl font-bold text-[#0b1830]">Offers & promo codes</h1>
            <p className="mt-2 text-sm text-slate-500">
              Create exclusive offers and discount codes for readers. All offers go through admin review before going live.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="shrink-0 rounded-xl bg-[#0b1830] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#13294d]"
          >
            + New offer
          </button>
        </div>

       
        {loading ? (
          <div className="grid place-items-center py-20">
            <p className="text-sm text-slate-400">Loading…</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 py-20">
            <p className="text-sm text-slate-400">No offers yet.</p>
            <button
              onClick={openCreate}
              className="mt-4 rounded-xl bg-[#2f7d1b] px-4 py-2 text-sm font-bold text-white hover:bg-[#246515]"
            >
              Create your first offer
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-[#0b1830]">{offer.title}</h3>
                      <StatusBadge status={offer.status} />
                    </div>

                    {offer.description && (
                      <p className="mt-1 text-sm text-slate-500">{offer.description}</p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-3">
                      {offer.promoCode && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Code</span>
                          <code className="rounded border border-dashed border-slate-300 px-2 py-0.5 text-xs font-bold text-[#0b1830]">
                            {offer.promoCode}
                          </code>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expires</span>
                        <span className="text-xs text-slate-600">
                          {new Date(offer.expiryDate).toLocaleDateString("en-IE", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Visibility</span>
                        <span className="text-xs text-slate-600 capitalize">{offer.visibility}</span>
                      </div>
                    </div>

                    {offer.status === "denied" && offer.rejectionReason && (
                      <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                        <span className="font-bold">Rejected: </span>{offer.rejectionReason}
                      </div>
                    )}
                  </div>

                  {["draft", "denied"].includes(offer.status) && (
                    <button
                      onClick={() => openEdit(offer)}
                      className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <OfferModal
          offer={editOffer}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadOffers();
          }}
        />
      )}
    </div>
  );
}