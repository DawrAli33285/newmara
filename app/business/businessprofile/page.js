"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

function SocialIcon({ network, className }) {
  const icons = {
    instagram: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <path d="M17.5 6.5h.01" />
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z" />
      </svg>
    ),
    tiktok: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M16.5 2h-3v13.5a2.5 2.5 0 11-2.5-2.5c.17 0 .34.02.5.05V9.98a5.5 5.5 0 105.5 5.52V8.9a7.46 7.46 0 004.5 1.5V7.4a4.5 4.5 0 01-4.5-4.5V2z" />
      </svg>
    ),
    twitter: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 00-7 3.7A11.7 11.7 0 013 4.9a4.1 4.1 0 001.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4a4.1 4.1 0 01-1.9.1c.5 1.6 2.1 2.8 3.9 2.9A8.2 8.2 0 012 18.6a11.6 11.6 0 006.3 1.9c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1z" />
      </svg>
    ),
  };

  return icons[network.toLowerCase()] || <span className="text-sm font-bold uppercase">{network.slice(0, 1)}</span>;
}

function EditProfileModal({ profile, onClose, onSaved }) {
  const entitlements = profile.digitalPartner?.package?.entitlements ?? {};
  const canShowGallery     = entitlements.galleryUrls    === true;
  const canShowVideo       = entitlements.promoVideoUrl  === true;
  const canShowOffers      = entitlements.offers         === true;
  const canShowSocial      = entitlements.socialLinks    === true;
  const canShowCta         = entitlements.ctaUrl         === true;
  const canShowWebsite     = entitlements.website        === true;
  const canShowTelephone   = entitlements.telephone      === true;
  const canShowMapUrl      = entitlements.mapUrl         === true;
  const canShowLocation    = entitlements.location       === true;
  const canShowDescription = entitlements.description    === true;
  const canShowLogo        = entitlements.logoUrl        === true;

  const [form, setForm] = useState({
    description:   profile.description    || "",
    location:      profile.location       || "",
    mapUrl:        profile.mapUrl         || "",
    website:       profile.website        || "",
    telephone:     profile.telephone      || "",
    logoUrl:       profile.logoUrl        || "",
    promoVideoUrl: profile.promoVideoUrl  || "",
    galleryUrls:   (profile.galleryUrls || []).join("\n"),
    instagram:     profile.socialLinks?.instagram || "",
    facebook:      profile.socialLinks?.facebook  || "",
    tiktok:        profile.socialLinks?.tiktok    || "",
    ctaText:       profile.ctaText        || "",
    ctaUrl:        profile.ctaUrl         || "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(profile.logoUrl || "");
  const [uploadingLogo, setUploadingLogo] = useState(false);

 
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(profile.promoVideoUrl || "");
  const [uploadingVideo, setUploadingVideo] = useState(false);


  const galleryLimit = entitlements.galleryLimit || 0;
  const [existingGalleryUrls, setExistingGalleryUrls] = useState(profile.galleryUrls || []);
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }



 

  function handleGallerySelect(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = galleryLimit - existingGalleryUrls.length - galleryImages.length;

    if (remainingSlots <= 0) {
      setError(`Your plan allows up to ${galleryLimit} gallery image(s). Remove one first.`);
      e.target.value = "";
      return;
    }

    const accepted = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setError(`Only ${remainingSlots} more image(s) can be added on your plan.`);
    }

    for (const file of accepted) {
      if (!file.type.startsWith("image/")) {
        setError("Gallery items must be image files.");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Each gallery image must be under 5MB.");
        continue;
      }
      setGalleryImages((prev) => [...prev, { file, preview: URL.createObjectURL(file) }]);
    }

    e.target.value = "";
  }

  function removeExistingGalleryImage(url) {
    setExistingGalleryUrls((prev) => prev.filter((u) => u !== url));
  }

  function removeNewGalleryImage(index) {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  }


  function handleLogoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Logo must be an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Logo must be under 5MB.");
      return;
    }

    setError(null);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function handleVideoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Promo video must be a video file.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("Promo video must be under 100MB.");
      return;
    }

    setError(null);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  }
  
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    
    let logoUrl = form.logoUrl;

    if (canShowLogo && logoFile) {
      setUploadingLogo(true);
      const uploadForm = new FormData();
      uploadForm.append("file", logoFile);

      try {
        const uploadRes = await fetch("/api/business/profile/logo", {
          method: "POST",
          body: uploadForm,
        });
        const uploadData = await uploadRes.json();
        setUploadingLogo(false);

        if (!uploadRes.ok) {
          setError(uploadData.error || "Logo upload failed.");
          setSaving(false);
          return;
        }

        logoUrl = uploadData.logoUrl;
      } catch (err) {
        setUploadingLogo(false);
        setError("Logo upload failed — please try again.");
        setSaving(false);
        return;
      }
    }

    let promoVideoUrl = form.promoVideoUrl;

    if (canShowVideo && videoFile) {
      setUploadingVideo(true);
      const uploadForm = new FormData();
      uploadForm.append("file", videoFile);

      try {
        const uploadRes = await fetch("/api/business/profile/video", {
          method: "POST",
          body: uploadForm,
        });
        const uploadData = await uploadRes.json();
        setUploadingVideo(false);

        if (!uploadRes.ok) {
          setError(uploadData.error || "Video upload failed.");
          setSaving(false);
          return;
        }

        promoVideoUrl = uploadData.promoVideoUrl;
      } catch (err) {
        setUploadingVideo(false);
        setError("Video upload failed — please try again.");
        setSaving(false);
        return;
      }
    }

  
    let galleryUrls = [...existingGalleryUrls];

    if (canShowGallery && galleryImages.length > 0) {
      setUploadingGallery(true);

      for (const { file } of galleryImages) {
        const uploadForm = new FormData();
        uploadForm.append("file", file);

        try {
          const uploadRes = await fetch("/api/business/profile/gallery", {
            method: "POST",
            body: uploadForm,
          });
          const uploadData = await uploadRes.json();

          if (!uploadRes.ok) {
            setUploadingGallery(false);
            setError(uploadData.error || "Gallery image upload failed.");
            setSaving(false);
            return;
          }

          galleryUrls.push(uploadData.imageUrl);
        } catch (err) {
          setUploadingGallery(false);
          setError("Gallery image upload failed — please try again.");
          setSaving(false);
          return;
        }
      }

      setUploadingGallery(false);
    }

   
    galleryUrls = galleryUrls.slice(0, galleryLimit);

   
    const payload = {
      ...(canShowDescription && { description: form.description }),
      ...(canShowLocation    && { location: form.location }),
      ...(canShowMapUrl      && { mapUrl: form.mapUrl }),
      ...(canShowWebsite     && { website: form.website }),
      ...(canShowTelephone   && { telephone: form.telephone }),
      ...(canShowLogo        && { logoUrl }),
      ...(canShowGallery     && { galleryUrls }),
      ...(canShowVideo  && { promoVideoUrl }),
      ...(canShowSocial && {
        socialLinks: {
          instagram: form.instagram,
          facebook:  form.facebook,
          tiktok:    form.tiktok,
        },
      }),
      ...(canShowCta && {
        ctaText: form.ctaText,
        ctaUrl:  form.ctaUrl,
      }),
    };
    try {
      const res = await fetch("/api/business/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setSaving(false);
        return;
      }

      onSaved(data);
    } catch (err) {
      setError("Network error — please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between">
          <h2 className="font-serif text-2xl font-normal text-[#0b1830]">
            Edit business profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <p className="mt-1 text-xs text-slate-500">
          Changes are submitted for admin review before they go live.
        </p>

    
        {profile.digitalPartner?.package?.name && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#edf2ec] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#2f7d1b]">
            {profile.digitalPartner.package.name} plan
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">

          
          {canShowDescription ? (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-xs text-slate-400">
              🔒 Business description — not included on your current plan
            </div>
          )}

         
          <div className="grid gap-4 sm:grid-cols-2">
            {canShowLocation ? (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Location</label>
                <input
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
                />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-xs text-slate-400">
                🔒 Location — not included on your current plan
              </div>
            )}

            {canShowMapUrl ? (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Map URL</label>
                <input
                  value={form.mapUrl}
                  onChange={(e) => update("mapUrl", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
                />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-xs text-slate-400">
                🔒 Map URL — not included on your current plan
              </div>
            )}

            {canShowWebsite ? (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Website</label>
                <input
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
                />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-xs text-slate-400">
                🔒 Website — not included on your current plan
              </div>
            )}

            {canShowTelephone ? (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Telephone</label>
                <input
                  value={form.telephone}
                  onChange={(e) => update("telephone", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
                />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-xs text-slate-400">
                🔒 Telephone — not included on your current plan
              </div>
            )}
          </div>

       
          {canShowLogo ? (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Logo</label>

              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-[#f0eee6]">
                  {logoPreview ? (
            
                    <img src={logoPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-400">No logo</span>
                  )}
                </div>

                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#edf2ec] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#2f7d1b] hover:file:bg-[#dcebd6]"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">PNG or JPG, up to 5MB.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-xs text-slate-400">
              🔒 Business logo — not included on your current plan
            </div>
          )}

       
                  {canShowGallery ? (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">Gallery images</label>
                <span className="text-[11px] text-slate-400">
                  {existingGalleryUrls.length + galleryImages.length} / {galleryLimit} used
                </span>
              </div>

              {(existingGalleryUrls.length > 0 || galleryImages.length > 0) && (
                <div className="mb-2 grid grid-cols-4 gap-2">
                  {existingGalleryUrls.map((url) => (
                    <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                      
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingGalleryImage(url)}
                        aria-label="Remove image"
                        className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {galleryImages.map((img, index) => (
                    <div key={img.preview} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                   
                      <img src={img.preview} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewGalleryImage(index)}
                        aria-label="Remove image"
                        className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {existingGalleryUrls.length + galleryImages.length < galleryLimit ? (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGallerySelect}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#edf2ec] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#2f7d1b] hover:file:bg-[#dcebd6]"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    PNG or JPG, up to 5MB each. {galleryLimit - existingGalleryUrls.length - galleryImages.length} remaining.
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-slate-400">
                  You've reached your plan's limit of {galleryLimit} gallery image(s). Remove one to add another.
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-xs text-slate-400">
              🔒 Gallery images — not included on your current plan
            </div>
          )}

         
                  {canShowVideo ? (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Promo video
              </label>

              {videoPreview && (
                <video
                  src={videoPreview}
                  controls
                  className="mb-2 w-full rounded-lg border border-slate-200 bg-black"
                  style={{ maxHeight: "200px" }}
                />
              )}

              <input
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#edf2ec] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#2f7d1b] hover:file:bg-[#dcebd6]"
              />
              <p className="mt-1 text-[11px] text-slate-400">MP4 or MOV, up to 100MB.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-xs text-slate-400">
              🔒 Promo video — not included on your current plan
            </div>
          )}


       
          {canShowSocial ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Instagram</label>
                <input
                  value={form.instagram}
                  onChange={(e) => update("instagram", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Facebook</label>
                <input
                  value={form.facebook}
                  onChange={(e) => update("facebook", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">TikTok</label>
                <input
                  value={form.tiktok}
                  onChange={(e) => update("tiktok", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-xs text-slate-400">
              🔒 Social links — not included on your current plan
            </div>
          )}

        
          {canShowCta ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">CTA Text</label>
                <input
                  value={form.ctaText}
                  onChange={(e) => update("ctaText", e.target.value)}
                  placeholder="e.g. Book a table"
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
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-xs text-slate-400">
              🔒 Custom CTA button — not included on your current plan
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#2f7d1b] px-5 py-2 text-sm font-bold text-white hover:bg-[#246515] disabled:opacity-60"
            >
                          {saving
                ? uploadingLogo
                  ? "Uploading logo…"
                  : uploadingVideo
                  ? "Uploading video…"
                  : uploadingGallery
                  ? "Uploading gallery…"
                  : "Submitting…"
                : "Submit for review"}

            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default function BusinessPage() {
  const { data: session, status } = useSession();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [pendingBanner, setPendingBanner] = useState(false);

  
  const isOwner = session?.user?.role === "business";

  const loadProfile = useCallback(async () => {
    if (status === "loading") return;

    setLoading(true);
    try {
      const res = await fetch("/api/business/profile", {
        cache: "no-store",
      });

      if (res.status === 401) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      if (res.status === 404) {
        setNotFound(true); 
        setLoading(false);
        return;
      }

      const data = await res.json();
      setProfile(data.businessProfile);
      setPendingBanner((data.businessProfile?.profileEdits?.length || 0) > 0);
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function track(eventType) {
    console.info("[frontend tracking]", eventType, {
      businessId: profile?.id,
    });
  }

  function nextImage() {
    if (!profile?.galleryUrls?.length) return;
    setActiveImage((c) => (c === profile.galleryUrls.length - 1 ? 0 : c + 1));
  }

  function previousImage() {
    if (!profile?.galleryUrls?.length) return;
    setActiveImage((c) => (c === 0 ? profile.galleryUrls.length - 1 : c - 1));
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f8f6]">
        <p className="text-sm text-slate-500">Loading profile…</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f8f6]">
        <p className="text-sm text-slate-500">Business not found.</p>
      </div>
    );
  }

  const gallery = profile.galleryUrls?.length ? profile.galleryUrls : [];
  const isFeatured = (profile.featuredPlacements || []).length > 0;
  const packageName = profile.digitalPartner?.package?.name;

  const entitlements = profile.digitalPartner?.package?.entitlements ?? {};
  const canShowGallery     = entitlements.galleryUrls    === true;
  const canShowVideo       = entitlements.promoVideoUrl  === true;
  const canShowOffers      = entitlements.offers         === true;
  const canShowSocial      = entitlements.socialLinks    === true;
  const canShowCta         = entitlements.ctaUrl         === true;
  const canShowWebsite     = entitlements.website        === true;
  const canShowTelephone   = entitlements.telephone      === true;
  const canShowMapUrl      = entitlements.mapUrl         === true;
  const canShowLocation    = entitlements.location       === true;
  const canShowDescription = entitlements.description    === true;

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-[#0b1830]">
      {isOwner && pendingBanner && (
        <div className="bg-amber-50 px-6 py-2 text-center text-xs font-semibold text-amber-800">
          You have changes pending admin review.
        </div>
      )}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[48px] w-[calc(100%-2rem)] max-w-[1180px] items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-[11px] text-slate-500">
          <span className="font-semibold text-[#0b1830]">
  {profile.business?.category?.name}
</span>
          </div>

          {isOwner && (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="my-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#0b1830] px-4 text-xs font-bold text-white hover:bg-[#13294d]"
            >
              ✎ Edit profile
            </button>
          )}
        </div>
      </div>

      <main className="mx-auto w-[calc(100%-2rem)] max-w-[1180px] pb-20">
        <section
          className={`mt-7 grid overflow-hidden rounded-2xl bg-[#0b1830] text-white shadow-[0_18px_45px_rgba(11,24,48,0.18)] lg:grid-cols-[0.9fr_1.1fr] ${
            isFeatured ? "ring-1 ring-[#c8ab60] ring-offset-4" : ""
          }`}
        >
          <div className="flex flex-col justify-center px-7 py-10 sm:px-12 sm:py-14 lg:px-14 lg:py-16">
            <div className="mb-7 flex flex-wrap gap-2">
              {isFeatured && (
                <span className="rounded-full bg-[#d8ba62] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#1a291d]">
                  ✦ Featured
                </span>
              )}
              {packageName && (
                <span className="rounded-full bg-[#29445c] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-200">
                  {packageName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#f0eee6] font-serif text-4xl font-bold text-[#2f7d1b]">
                {profile.logoUrl ? (
               
                  <img
                    src={profile.logoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile.business?.businessName?.slice(0, 1) || "?"
                )}
              </div>

              <div>
              <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9aabba]">
  {profile.business?.category?.name}
</p>
                <h1 className="font-serif text-4xl leading-none tracking-tight sm:text-5xl">
                  {profile.business?.businessName}
                </h1>
              </div>
            </div>

            {canShowLocation && profile.location && (
              <p className="mt-5 flex items-center gap-2 text-sm text-[#b9c8d3]">
                <span className="text-base">⌖</span>
                {profile.location}
              </p>
            )}

            {canShowDescription && profile.description && (
              <p className="mt-5 max-w-lg text-base leading-7 text-[#d4dfe6]">
                {profile.description}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {canShowOffers && profile.offers?.length > 0 && (
                <a
                  href="#offers"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#b9e757] px-5 text-sm font-bold text-[#152313] transition hover:-translate-y-0.5 hover:bg-[#c8f36d]"
                >
                  View live offers <span>→</span>
                </a>
              )}
              <a
                href="#contact"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#64778a] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#203954]"
              >
                Get in touch
              </a>
            </div>
          </div>

          {gallery[0] && (
            <div
              className="relative min-h-[340px] bg-cover bg-center lg:min-h-[500px]"
              style={{ backgroundImage: `url(${gallery[0]})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#071322d9] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-7 right-7 flex items-center justify-between text-xs text-white">
                <span>Explore {profile.location}</span>
                <span>01 / 0{gallery.length}</span>
              </div>
            </div>
          )}
        </section>

        <div className="grid gap-14 pt-16 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-20 lg:pt-20">
          <div>
            {canShowOffers && profile.offers?.length > 0 && (
              <section id="offers" className="pb-16">
                <div className="mb-7 flex items-end justify-between gap-4">
                  <div>
                    <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
                      Exclusive for readers
                    </p>
                    <h2 className="font-serif text-4xl font-normal tracking-tight">
                      Live offers
                    </h2>
                  </div>
                  <span className="whitespace-nowrap text-xs font-bold text-[#2f7d1b]">
                    <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#7fbd43]" />
                    Live now
                  </span>
                </div>

                <div className="grid gap-4">
                  {profile.offers.map((offer) => (
                    <article
                      key={offer.id}
                      className="grid overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg sm:grid-cols-[165px_1fr]"
                    >
                      {offer.imageUrl && (
                        <div
                          className="relative min-h-[170px] bg-cover bg-center"
                          style={{ backgroundImage: `url(${offer.imageUrl})` }}
                        >
                          <span className="absolute bottom-3 left-3 rounded bg-[#0b1830e8] px-2 py-1 text-[10px] text-white">
                            Ends{" "}
                            {new Date(offer.expiryDate).toLocaleDateString(
                              "en-IE",
                              { day: "2-digit", month: "short" },
                            )}
                          </span>
                        </div>
                      )}

                      <div className="p-5">
                        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-[#2f7d1b]">
                          Reader offer
                        </p>
                        <h3 className="font-serif text-2xl font-normal">
                          {offer.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {offer.description}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                          {offer.promoCode && (
                            <code className="rounded border border-dashed border-slate-300 px-2 py-1 text-[11px] text-slate-500">
                              {offer.promoCode}
                            </code>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              track("offer_action");
                              window.open(offer.ctaUrl, "_blank", "noopener,noreferrer");
                            }}
                            className="text-xs font-bold text-[#2f7d1b] hover:text-[#246515]"
                          >
                            {offer.ctaText || "Redeem offer"} →
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {canShowGallery && gallery.length > 0 && (
              <section className="pb-16">
                <div className="mb-7 flex items-end justify-between">
                  <div>
                    <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
                      A closer look
                    </p>
                    <h2 className="font-serif text-4xl font-normal tracking-tight">
                      Gallery
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">
                    0{activeImage + 1} / 0{gallery.length}
                  </span>
                </div>

                <div
                  className="relative flex h-[290px] items-center justify-between overflow-hidden rounded-xl bg-cover bg-center px-4 sm:h-[390px]"
                  style={{ backgroundImage: `url(${gallery[activeImage]})` }}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  <button
                    type="button"
                    onClick={previousImage}
                    aria-label="Previous image"
                    className="relative grid h-10 w-10 place-items-center rounded-full bg-[#0b1830cc] text-xl text-white transition hover:bg-[#0b1830]"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Next image"
                    className="relative grid h-10 w-10 place-items-center rounded-full bg-[#0b1830cc] text-xl text-white transition hover:bg-[#0b1830]"
                  >
                    →
                  </button>
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {gallery.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      aria-label={`Show image ${index + 1}`}
                      className={`h-16 w-24 shrink-0 rounded-md bg-cover bg-center transition ${
                        activeImage === index
                          ? "opacity-100 ring-2 ring-[#2f7d1b] ring-offset-2"
                          : "opacity-50 hover:opacity-80"
                      }`}
                      style={{ backgroundImage: `url(${image})` }}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside id="contact" className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
                Plan your visit
              </p>
              <h2 className="font-serif text-4xl font-normal tracking-tight">
                Make it happen.
              </h2>

              <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
                {canShowWebsite && profile.website && (
                  <a
                    href={profile.website}
                    onClick={() => track("website_click")}
                    className="flex items-center gap-3 py-4 text-xs text-slate-600 hover:text-[#2f7d1b]"
                  >
                    <span className="text-base">◎</span>
                    <span>Visit website</span>
                    <span className="ml-auto">→</span>
                  </a>
                )}
                {canShowTelephone && profile.telephone && (
                  <a
                    href={`tel:${profile.telephone}`}
                    onClick={() => track("telephone_click")}
                    className="flex items-center gap-3 py-4 text-xs text-slate-600 hover:text-[#2f7d1b]"
                  >
                    <span className="text-base">⌕</span>
                    <span>{profile.telephone}</span>
                    <span className="ml-auto">→</span>
                  </a>
                )}

                {canShowMapUrl && profile.mapUrl && (
                  <a
                    href={profile.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => track("map_click")}
                    className="flex items-center gap-3 py-4 text-xs text-slate-600 hover:text-[#2f7d1b]"
                  >
                    <span className="text-base">⌖</span>
                    <span>View on map</span>
                    <span className="ml-auto">→</span>
                  </a>
                )}
              </div>

              {canShowCta && profile.ctaUrl && (
                <a
                  href={profile.ctaUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track("cta_click")}
                  className="mt-6 flex min-h-12 items-center justify-center rounded-lg bg-[#2f7d1b] text-sm font-bold text-white transition hover:bg-[#246515]"
                >
                  {profile.ctaText || "Get in touch"} →
                </a>
              )}
            </div>

            {canShowVideo && profile.promoVideoUrl && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <video
                  src={profile.promoVideoUrl}
                  controls
                  className="h-48 w-full bg-black object-cover"
                  onPlay={() => track("video_view")}
                />
                <div className="p-5">
                  <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
                    See it for yourself
                  </p>
                  <h3 className="font-serif text-2xl font-normal">
                    {profile.location ? `A weekend in ${profile.location}` : "Watch the video"}
                  </h3>
                </div>
              </div>
            )}

            {canShowSocial &&
              profile.socialLinks &&
              Object.values(profile.socialLinks).some(Boolean) && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
                    Follow along
                  </p>
                                  <div className="mt-4 flex gap-2">
                    {Object.entries(profile.socialLinks)
                      .filter(([, url]) => Boolean(url))
                      .map(([network, url]) => (
                        <a
                          key={network}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={network}
                          className="grid h-10 w-10 place-items-center rounded-full bg-[#edf2ec] text-[#2f7d1b] transition hover:bg-[#dcebd6]"
                        >
                          <SocialIcon network={network} className="h-4 w-4" />
                        </a>
                      ))}
                  </div>
                </div>
              )}
          </aside>
        </div>
      </main>

      <footer className="bg-[#0b1830] text-xs text-slate-400">
        <div className="mx-auto flex w-[calc(100%-2rem)] max-w-[1180px] flex-col gap-2 py-7 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-serif text-lg text-white">Mara Media</span>
          <span>
            Discover more local stories ·{" "}
           
          </span>
        </div>
      </footer>

      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            setPendingBanner(true);
          }}
        />
      )}
    </div>
  );
}