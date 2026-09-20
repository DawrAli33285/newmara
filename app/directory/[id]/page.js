"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

function Pin() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function DirectoryListingPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const isOwnerOrAdmin =
    session?.user?.role === "admin" ||
    (session?.user?.accountType === "business" && session.user.id === listing?.businessId);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/directory/${id}`);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.error === "not_live") {
          setPendingStatus(body.status);
        } else {
          setNotFound(true);
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("[directory listing] full listing payload:", data.listing);
      console.log("[directory listing] entitlements:", data.listing?.entitlements);
      console.log("[directory listing] clickablePhone value:", data.listing?.entitlements?.clickablePhone, typeof data.listing?.entitlements?.clickablePhone);
      setListing(data.listing);
      setLoading(false);
    }

    if (id) load();
  }, [id]);

  // fire the view event only once listing + session are both known, and only for non-owner/non-admin viewers
  useEffect(() => {
    if (!listing || session === undefined) return;
    if (isOwnerOrAdmin) return;

    fetch("/api/track/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventType: "directory_profile_view",
        directoryListingId: id,
      }),
    }).catch(() => {});
  }, [listing, session, isOwnerOrAdmin, id]);

  function track(eventType) {
    if (isOwnerOrAdmin) return;

    fetch("/api/track/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventType,
        directoryListingId: id,
      }),
    }).catch(() => {});
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F7F8FA]">
        <p className="text-[14px] text-[#657084]">Loading…</p>
      </main>
    );
  }

  const PENDING_MESSAGES = {
    draft: "This listing is still being set up and isn't public yet.",
    submitted: "This listing is awaiting approval and isn't public yet.",
    mara_review: "This listing is awaiting approval and isn't public yet.",
    approved: "This listing is approved and will go live soon.",
    scheduled: "This listing is scheduled and will go live soon.",
    expired: "This listing has expired.",
    denied: "This listing is not available.",
  };

  if (pendingStatus) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F7F8FA]">
        <p className="text-[14px] text-[#657084]">
          {PENDING_MESSAGES[pendingStatus] || "This listing isn't public yet."}
        </p>
      </main>
    );
  }

  if (notFound || !listing) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F7F8FA]">
        <p className="text-[14px] text-[#657084]">Listing not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <div className="border-b border-[#D9E0E7] bg-white">
        <div className="mx-auto flex min-h-[48px] w-[calc(100%-2rem)] max-w-[720px] items-center gap-2 overflow-x-auto whitespace-nowrap text-[11px] text-[#657084]">
          {listing.publications?.[0] && (
            <>
              <Link href={`/publication/${listing.publications[0].slug}/view`} className="hover:text-[#2F7D1B]">
                {listing.publications[0].title}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="font-semibold text-[#0B1830]">{listing.business?.category?.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-[720px] px-6 py-14">
        <span className="inline-block rounded-full bg-[#EDF5DF] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#527323]">
          {listing.business?.category?.name}
        </span>

        <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-[#0B1830] sm:text-5xl">
          {listing.businessName}
        </h1>

        {listing.location && (
          <p className="mt-3 flex items-center gap-2 text-[15px] text-[#657084]">
            <Pin />
            {listing.location}
          </p>
        )}

        <div className="mt-8 divide-y divide-[#D9E0E7] rounded-xl border border-[#D9E0E7] bg-white">
          {listing.website && (
            <a
              href={listing.website}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("website_click")}
              className="flex items-center gap-3 px-5 py-4 text-[14px] text-[#0B1830] hover:text-[#2F7D1B]"
            >
              <span className="text-base">◎</span>
              <span>Visit website</span>
              <span className="ml-auto">→</span>
            </a>
          )}

{listing.telephone && listing.entitlements?.clickablePhone !== false && (
            <a
            href={`tel:${listing.telephone}`}
            onClick={() => track("telephone_click")}
            className="flex items-center gap-3 px-5 py-4 text-[14px] text-[#0B1830] hover:text-[#2F7D1B]"
          >
            <span className="text-base">⌕</span>
            <span>{listing.telephone}</span>
            <span className="ml-auto">→</span>
          </a>
        )}

        {listing.telephone && listing.entitlements?.clickablePhone === false && (
          <div className="flex items-center gap-3 px-5 py-4 text-[14px] text-[#0B1830]">
            <span className="text-base">⌕</span>
            <span>{listing.telephone}</span>
          </div>
        )}

        {!listing.website && !listing.telephone && (
          <p className="px-5 py-6 text-center text-[13px] text-[#657084]">
            No contact details available yet.
          </p>
        )}
        </div>
      </div>
    </main>
  );
}