"use client";

import { useEffect, useMemo, useState } from "react";

const ARTWORK_STATUSES = [
  "awaiting_artwork",
  "received",
  "in_design",
  "awaiting_approval",
  "approved",
  "ready_for_print",
];

const ARTWORK_LABEL = {
  awaiting_artwork: "Awaiting artwork",
  received: "Received",
  in_design: "In design",
  awaiting_approval: "Awaiting approval",
  approved: "Approved",
  ready_for_print: "Ready for print",
};

const ARTWORK_COLOR = {
  awaiting_artwork: "bg-red-50 border-red-200 text-red-700",
  received: "bg-orange-50 border-orange-200 text-orange-700",
  in_design: "bg-amber-50 border-amber-200 text-amber-700",
  awaiting_approval: "bg-blue-50 border-blue-200 text-blue-700",
  approved: "bg-emerald-50 border-emerald-200 text-emerald-700",
  ready_for_print: "bg-[#eaf3e8] border-[#2f7d1b]/30 text-[#2f7d1b]",
};

const AD_STATUS_COLOR = {
  pending: "bg-amber-50 border-amber-200 text-amber-700",
  approved: "bg-emerald-50 border-emerald-200 text-emerald-700",
  rejected: "bg-red-50 border-red-200 text-red-700",
};


const APPROVED_STATUSES = ["approved", "ready_for_print"];

const AD_SIZES = ["Full Page", "Half Page", "Quarter Page", "DPS"];

function emptyForm(publicationId) {
  return {
    id: null,
    advertiserId: "",
    publicationId,
    packageId: "",
    pageNumber: "",
    pageSpan: 1,
    adSize: "Full Page",
    position: "",
    artworkStatus: "awaiting_artwork",
    artworkUrl: "",
    artworkFileName: "",
    artworkFileType: "",
    paymentStatus: "pending",
    startDate: new Date().toISOString().slice(0, 10),
    expiryDate: "",
  };
}

export default function FlatPlanBoard({
  issueId,
  totalPages,
  publicationId,
  advertisers,
  packages,
}) {
  const [pages, setPages] = useState([]);
  const [unplaced, setUnplaced] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  
  const [digitalAds, setDigitalAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(true);
  const [adsError, setAdsError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/issues/${issueId}/flatplan`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load flat plan.");
      setPages(data.pages || []);
      setUnplaced(data.unplaced || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadDigitalAds() {
    setAdsLoading(true);
    setAdsError("");
    try {
      const res = await fetch(`/api/admin/publications/${publicationId}/ads`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load digital ads.");
      setDigitalAds(data.ads || []);
    } catch (err) {
      setAdsError(err.message);
    } finally {
      setAdsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [issueId]);

  useEffect(() => {
    if (publicationId) loadDigitalAds();
  }, [publicationId]);


  const allBookings = useMemo(() => {
    const fromPages = pages
      .filter((p) => p.booking && p.booking.isSpreadStart)
      .map((p) => p.booking);
    return [...fromPages, ...unplaced];
  }, [pages, unplaced]);

  const pendingCount = useMemo(
    () => allBookings.filter((b) => !APPROVED_STATUSES.includes(b.artworkStatus)).length,
    [allBookings]
  );

  const approvedBookings = useMemo(
    () => allBookings.filter((b) => APPROVED_STATUSES.includes(b.artworkStatus)),
    [allBookings]
  );

  // Digital ad counts/lists
  const digitalPendingCount = useMemo(
    () => digitalAds.filter((a) => a.status === "pending").length,
    [digitalAds]
  );
  const digitalApprovedAds = useMemo(
    () => digitalAds.filter((a) => a.status === "approved"),
    [digitalAds]
  );

  function openNewForPage(pageNumber) {
    setModal({ mode: "new", form: { ...emptyForm(publicationId), pageNumber } });
  }

  function openNewUnplaced() {
    setModal({ mode: "new", form: emptyForm(publicationId) });
  }

  async function openEdit(bookingId) {
    setError("");
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load booking.");
      const b = data.booking;
      setModal({
        mode: "edit",
        form: {
          id: b.id,
          advertiserId: b.advertiserId,
          publicationId: b.publicationId,
          packageId: b.packageId || "",
          pageNumber: b.pageNumber ?? "",
          pageSpan: b.pageSpan || 1,
          adSize: b.adSize || "Full Page",
          position: b.position || "",
          artworkStatus: b.artworkStatus,
          artworkUrl: b.artworkUrl || "",
          artworkFileName: b.artworkFileName || "",
          artworkFileType: b.artworkFileType || "",
          paymentStatus: b.paymentStatus,
          startDate: b.startDate?.slice(0, 10) || "",
          expiryDate: b.expiryDate?.slice(0, 10) || "",
        },
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { form } = modal;
    const isEdit = modal.mode === "edit";
    const url = isEdit
      ? `/api/admin/bookings/${form.id}`
      : "/api/admin/bookings";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiserId: form.advertiserId,
          publicationId: form.publicationId,
          issueId,
          packageId: form.packageId || null,
          pageNumber: form.pageNumber === "" ? null : Number(form.pageNumber),
          pageSpan: Number(form.pageSpan) || 1,
          adSize: form.adSize,
          position: form.position,
          artworkStatus: form.artworkStatus,
          artworkUrl: form.artworkUrl || null,
          artworkFileName: form.artworkFileName || null,
          artworkFileType: form.artworkFileType || null,
          paymentStatus: form.paymentStatus,
          startDate: form.startDate,
          expiryDate: form.expiryDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save booking.");
      setModal(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
        Loading flat plan…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && !modal && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

     
      
      <div>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
          Digital ads
        </h2>
        {adsError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {adsError}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-amber-50 border-amber-200 text-amber-700 px-4 py-3">
            <p className="text-2xl font-bold">
              {adsLoading ? "…" : digitalPendingCount}
            </p>
            <p className="text-xs font-semibold">Pending</p>
          </div>
          <div className="rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-700 px-4 py-3">
            <p className="text-2xl font-bold">
              {adsLoading ? "…" : digitalApprovedAds.length}
            </p>
            <p className="text-xs font-semibold">Approved</p>
          </div>
        </div>
      </div>

      
      <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
          Approved digital ads
        </h2>

        {adsLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : digitalApprovedAds.length === 0 ? (
          <p className="text-sm text-gray-400">No approved digital ads yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {digitalApprovedAds.map((ad) => (
              <div
                key={ad.id}
                className={`rounded-lg border p-3 text-left ${AD_STATUS_COLOR[ad.status]}`}
              >
                <p className="text-sm font-semibold">
                  {ad.linkType === "video" ? "▶ Video" : "🔗 Link"}
                  {ad.label ? ` — ${ad.label}` : ""}
                </p>
                <p className="mt-1 text-xs opacity-80 truncate">
                  {ad.advertiser?.advertiserName}
                </p>
                <p className="mt-1 text-xs opacity-70">
                  ${(ad.priceCents / 100).toFixed(2)} · {ad.clickCount} click
                  {ad.clickCount === 1 ? "" : "s"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

   


      {modal && (
        <BookingModal
          mode={modal.mode}
          form={modal.form}
          setForm={(form) => setModal({ ...modal, form })}
          advertisers={advertisers}
          packages={packages}
          totalPages={totalPages}
          error={error}
          saving={saving}
          onCancel={() => {
            setModal(null);
            setError("");
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function BookingModal({
  mode,
  form,
  setForm,
  advertisers,
  packages,
  totalPages,
  error,
  saving,
  onCancel,
  onSave,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("bookingId", form.id || "unfiled");

      const res = await fetch("/api/(admin)/bookings/artwork", {
        method: "POST",
        body,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed.");

      setForm({
        ...form,
        artworkUrl: data.artworkUrl,
        artworkFileName: data.fileName,
        artworkFileType: data.fileType,
        artworkStatus:
          form.artworkStatus === "awaiting_artwork" ? "received" : form.artworkStatus,
      });
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeArtwork() {
    setForm({ ...form, artworkUrl: "", artworkFileName: "", artworkFileType: "" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-[#0b1830]">
          {mode === "edit" ? "Edit booking" : "New booking"}
        </h2>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">
              Advertiser
            </label>
            <select
              required
              value={form.advertiserId}
              onChange={(e) => update("advertiserId", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select advertiser…</option>
              {advertisers.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.advertiserName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">
                Page number
              </label>
              <input
                type="number"
                min={1}
                max={totalPages || undefined}
                value={form.pageNumber}
                onChange={(e) => update("pageNumber", e.target.value)}
                placeholder="Unplaced"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">
                Page span
              </label>
              <input
                type="number"
                min={1}
                value={form.pageSpan}
                onChange={(e) => update("pageSpan", e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">
                Ad size
              </label>
              <select
                value={form.adSize}
                onChange={(e) => update("adSize", e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {AD_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">
                Package
              </label>
              <select
                value={form.packageId}
                onChange={(e) => update("packageId", e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">
              Position notes
            </label>
            <input
              type="text"
              value={form.position}
              onChange={(e) => update("position", e.target.value)}
              placeholder="e.g. Inside front cover"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">
              Artwork file
            </label>

            {uploadError && (
              <div className="mt-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {uploadError}
              </div>
            )}

            {form.artworkUrl ? (
              <div className="mt-1 flex items-center justify-between gap-3 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2">
                <a
                  href={form.artworkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 truncate text-sm font-semibold text-[#1c3664] hover:underline"
                >
                  {form.artworkFileName || "View artwork"}
                </a>
                <div className="flex shrink-0 items-center gap-3">
                  <label className="cursor-pointer text-xs font-semibold text-[#1c3664] hover:underline">
                    {uploading ? "Uploading…" : "Replace"}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={removeArtwork}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="mt-1 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-sm text-gray-500 hover:border-[#1c3664] hover:text-[#1c3664]">
                {uploading ? "Uploading…" : "+ Upload artwork (image or PDF, max 25MB)"}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">
                Artwork status
              </label>
              <select
                value={form.artworkStatus}
                onChange={(e) => update("artworkStatus", e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {ARTWORK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ARTWORK_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">
                Payment status
              </label>
              <select
                value={form.paymentStatus}
                onChange={(e) => update("paymentStatus", e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">
                Start date
              </label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500">
                Expiry date
              </label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => update("expiryDate", e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#1c3664] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#13294d] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}