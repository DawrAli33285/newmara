"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";



function ArrowRight() {
  return (
    <svg
      className="h-4 w-4 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function Pin() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" strokeLinecap="round" />
    </svg>
  );
}


function BusinessCard({ business, linkToBusiness, linkToDirectory }) {
  const content = (
    <>
      <p className="text-[15px] font-bold text-[#0B1830]">{business.businessName}</p>
      <span className="mt-1.5 inline-block rounded-full bg-[#EDF5DF] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#527323]">
        {business.category}
      </span>
      {business.location && (
        <p className="mt-3 flex items-center gap-1.5 text-[13px] text-[#657084]">
          <Pin />
          {business.location}
        </p>
      )}
    </>
  );

  const href = linkToBusiness
    ? `/business/${business.id}`
    : linkToDirectory
      ? `/directory/${business.id}?from=directory`
      : null;

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-[#D9E0E7] bg-white p-5 transition hover:border-[#2F7D1B]/40 hover:shadow-sm"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-[#D9E0E7] bg-white p-5 transition hover:border-[#2F7D1B]/40 hover:shadow-sm">
      {content}
    </div>
  );
}

export default function PublicationViewPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [pub, setPub] = useState(null);
  const [directoryListings, setDirectoryListings] = useState([]);
  const [digitalPartners, setDigitalPartners] = useState([]);
  const [allPublications, setAllPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [tab, setTab] = useState("directory");
  const [directoryCategory, setDirectoryCategory] = useState("");
  const [partnerCategory, setPartnerCategory] = useState("");


  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/publications/${slug}`);

      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setPub(data.publication);
      setDirectoryListings(data.directoryListings || []);
      setDigitalPartners(data.digitalPartners || []);
      setLoading(false);
    }

    if (slug) load();
  }, [slug]);

  useEffect(() => {
    async function loadPublications() {
      const res = await fetch(`/api/publications`);
      if (!res.ok) return;
      const data = await res.json();
      setAllPublications(data.publications || []);
    }
    loadPublications();
  }, []);

  const directoryCategories = useMemo(
    () => [...new Set(directoryListings.map((b) => b.category).filter(Boolean))].sort(),
    [directoryListings]
  );
  const partnerCategories = useMemo(
    () => [...new Set(digitalPartners.map((b) => b.category).filter(Boolean))].sort(),
    [digitalPartners]
  );

  const filteredDirectory = directoryListings.filter(
    (b) => !directoryCategory || b.category === directoryCategory
  );
  const filteredPartners = digitalPartners.filter(
    (b) => !partnerCategory || b.category === partnerCategory
  );

  function goToPublication(newSlug) {
    if (newSlug) router.push(`/publication/${newSlug}`);
  }



  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F7F8FA]">
        <p className="text-[14px] text-[#657084]">Loading…</p>
      </main>
    );
  }

  if (notFound || !pub) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F7F8FA]">
        <p className="text-[14px] text-[#657084]">Publication not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
     
      <section className="border-b border-[#D9E0E7] bg-[#0B1830]">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h1 className="font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {pub.title}
          </h1>

          {pub.description && (
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-300">
              {pub.description}
            </p>
          )}

<div className="mt-8 flex flex-wrap items-center gap-4">
  <Link
    href={`/read/${pub.slug}`}
    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#2F7D1B] px-6 text-[15px] font-bold text-white transition hover:bg-[#256315]"
  >
    View Issues
    <ArrowRight />
  </Link>

  <Link
    href={`/read/ads/${pub.slug}`}
    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 text-[15px] font-bold text-white transition hover:bg-white/10"
  >
    View Ads
    <ArrowRight />
  </Link>

  <span className="text-[13px] font-semibold text-slate-400">
    {pub.issueCount} issue{pub.issueCount === 1 ? "" : "s"} published
  </span>

  <span className="text-[13px] font-semibold text-slate-400">
    {pub.adCount} ad{pub.adCount === 1 ? "" : "s"}
  </span>

  {allPublications.length > 0 && (
    <select
      value={pub.slug}
      onChange={(e) => goToPublication(e.target.value)}
      className="h-10 rounded-lg border border-white/20 bg-white/5 px-3 text-[13px] font-medium text-white focus:border-white/40 focus:outline-none"
    >
      {allPublications.map((p) => (
        <option key={p.slug} value={p.slug} className="text-[#0B1830]">
          {p.title}
        </option>
      ))}
    </select>
  )}
</div>


        </div>
      </section>

    
      <section className="mx-auto max-w-6xl px-6 py-12">
     
        <div className="flex gap-2 border-b border-[#D9E0E7]">
          <button
            onClick={() => setTab("directory")}
            className={`px-4 pb-3 text-[14px] font-bold transition ${
              tab === "directory"
                ? "border-b-2 border-[#2F7D1B] text-[#0B1830]"
                : "text-[#657084] hover:text-[#0B1830]"
            }`}
          >
            Business Directory
          </button>
          <button
            onClick={() => setTab("digital")}
            className={`px-4 pb-3 text-[14px] font-bold transition ${
              tab === "digital"
                ? "border-b-2 border-[#2F7D1B] text-[#0B1830]"
                : "text-[#657084] hover:text-[#0B1830]"
            }`}
          >
            Digital Partners
          </button>
        </div>

      
        {tab === "directory" && (
          <div className="mt-6">
            <div className="mb-5 flex flex-wrap items-center gap-3">
            <select
                value={directoryCategory}
                onChange={(e) => setDirectoryCategory(e.target.value)}
                className="h-10 rounded-lg border border-[#D9E0E7] bg-white px-3 text-[13px] font-medium text-[#0B1830] focus:border-[#2F7D1B] focus:outline-none"
              >
                <option value="">All categories</option>
                {directoryCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span className="text-[13px] text-[#657084]">
                {filteredDirectory.length} listing{filteredDirectory.length === 1 ? "" : "s"}
              </span>
            </div>

            {filteredDirectory.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#D9E0E7] py-14 text-center text-[14px] text-[#657084]">
                No directory listings match this category yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
               {filteredDirectory.map((b) => (
                  <BusinessCard key={b.id} business={b} linkToDirectory />
                ))} 
              </div>
            )}
          </div>
        )}

       
        {tab === "digital" && (
          <div className="mt-6">
            <div className="mb-5 flex flex-wrap items-center gap-3">
            <select
                value={partnerCategory}
                onChange={(e) => setPartnerCategory(e.target.value)}
                className="h-10 rounded-lg border border-[#D9E0E7] bg-white px-3 text-[13px] font-medium text-[#0B1830] focus:border-[#2F7D1B] focus:outline-none"
              >
                <option value="">All categories</option>
                {partnerCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span className="text-[13px] text-[#657084]">
                {filteredPartners.length} partner{filteredPartners.length === 1 ? "" : "s"}
              </span>
            </div>

            {filteredPartners.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#D9E0E7] py-14 text-center text-[14px] text-[#657084]">
                No digital partners match this category yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPartners.map((b) => (
                  <BusinessCard key={b.id} business={b} linkToBusiness />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}