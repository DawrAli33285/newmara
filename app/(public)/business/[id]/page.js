// // after
// // after
// "use client";

// import { useState, useEffect } from "react";
// import { useParams } from "next/navigation";

// function SocialIcon({ network, className }) {
//   const icons = {
//     instagram: (
//       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
//         <rect x="2" y="2" width="20" height="20" rx="5" />
//         <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
//         <path d="M17.5 6.5h.01" />
//       </svg>
//     ),
//     facebook: (
//       <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
//         <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z" />
//       </svg>
//     ),
//     tiktok: (
//       <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
//         <path d="M16.5 2h-3v13.5a2.5 2.5 0 11-2.5-2.5c.17 0 .34.02.5.05V9.98a5.5 5.5 0 105.5 5.52V8.9a7.46 7.46 0 004.5 1.5V7.4a4.5 4.5 0 01-4.5-4.5V2z" />
//       </svg>
//     ),
//     twitter: (
//       <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
//         <path d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 00-7 3.7A11.7 11.7 0 013 4.9a4.1 4.1 0 001.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4a4.1 4.1 0 01-1.9.1c.5 1.6 2.1 2.8 3.9 2.9A8.2 8.2 0 012 18.6a11.6 11.6 0 006.3 1.9c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1z" />
//       </svg>
//     ),
//   };

//   return icons[network.toLowerCase()] || <span className="text-sm font-bold uppercase">{network.slice(0, 1)}</span>;
// }

// export default function BusinessPage() {
//   const { id } = useParams();
//   const [business, setBusiness] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [notFound, setNotFound] = useState(false);
//   const [activeImage, setActiveImage] = useState(0);

//   useEffect(() => {
//     async function load() {
//       const res = await fetch(`/api/business/${id}`);
//       if (!res.ok) {
//         setNotFound(true);
//         setLoading(false);
//         return;
//       }
//       const data = await res.json();
//       setBusiness(data.business);
//       setLoading(false);
//     }
//     if (id) load();
//   }, [id]);

//   if (loading) {
//     return (
//       <div className="grid min-h-screen place-items-center bg-[#f7f8f6]">
//         <p className="text-sm text-slate-500">Loading…</p>
//       </div>
//     );
//   }

//   if (notFound || !business) {
//     return (
//       <div className="grid min-h-screen place-items-center bg-[#f7f8f6]">
//         <p className="text-sm text-slate-500">Business not found.</p>
//       </div>
//     );
//   }

//   function track(eventType) {
//     console.info("[frontend tracking]", eventType, {
//       businessId: business.id,
//     });
//   }

//   function nextImage() {
//     setActiveImage((current) =>
//       current === business.galleryUrls.length - 1 ? 0 : current + 1,
//     );
//   }

//   function previousImage() {
//     setActiveImage((current) =>
//       current === 0 ? business.galleryUrls.length - 1 : current - 1,
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#f7f8f6] text-[#0b1830]">
//       <div className="border-b border-slate-200 bg-white">
//         <div className="mx-auto flex min-h-[48px] w-[calc(100%-2rem)] max-w-[1180px] items-center gap-2 overflow-x-auto whitespace-nowrap text-[11px] text-slate-500">
//           <a href="/browse" className="hover:text-[#2f7d1b]">
//             Publications
//           </a>
//           <span>/</span>
//           <a href="/browse" className="hover:text-[#2f7d1b]">
//             Discover Ireland
//           </a>
//           <span>/</span>
//           <span className="font-semibold text-[#0b1830]">
//             {business.category}
//           </span>
//         </div>
//       </div>

//       <main className="mx-auto w-[calc(100%-2rem)] max-w-[1180px] pb-20">
//         <section
//           className={`mt-7 grid overflow-hidden rounded-2xl bg-[#0b1830] text-white shadow-[0_18px_45px_rgba(11,24,48,0.18)] lg:grid-cols-[0.9fr_1.1fr] ${
//             business.featured
//               ? "ring-1 ring-[#c8ab60] ring-offset-4"
//               : ""
//           }`}
//         >
//           <div className="flex flex-col justify-center px-7 py-10 sm:px-12 sm:py-14 lg:px-14 lg:py-16">
//             <div className="mb-7 flex flex-wrap gap-2">
//               {business.featured && (
//                 <span className="rounded-full bg-[#d8ba62] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#1a291d]">
//                   ✦ Featured
//                 </span>
//               )}

//               <span className="rounded-full bg-[#29445c] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-200">
//                 Digital partner
//               </span>
//             </div>

//             <div className="flex items-center gap-4">
//             <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#f0eee6] font-serif text-4xl font-bold text-[#2f7d1b]">
//                 {business.logoUrl ? (
//                   <img
//                     src={business.logoUrl}
//                     alt={business.businessName}
//                     className="h-full w-full object-cover"
//                   />
//                 ) : (
//                   business.businessName?.[0]?.toUpperCase()
//                 )}
//               </div>

//               <div>
//                 <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9aabba]">
//                   {business.category}
//                 </p>

//                 <h1 className="font-serif text-4xl leading-none tracking-tight sm:text-5xl">
//                   {business.businessName}
//                 </h1>
//               </div>
//             </div>

//             <p className="mt-5 flex items-center gap-2 text-sm text-[#b9c8d3]">
//               <span className="text-base">⌖</span>
//               {business.location}
//             </p>

//             <p className="mt-5 max-w-lg text-base leading-7 text-[#d4dfe6]">
//               {business.shortDescription}
//             </p>

//             <div className="mt-8 flex flex-wrap gap-3">
//               <a
//                 href="#offers"
//                 className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#b9e757] px-5 text-sm font-bold text-[#152313] transition hover:-translate-y-0.5 hover:bg-[#c8f36d]"
//               >
//                 View live offers
//                 <span>→</span>
//               </a>

//               <a
//                 href="#contact"
//                 className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#64778a] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#203954]"
//               >
//                 Get in touch
//               </a>
//             </div>
//           </div>

//           <div
//             className="relative min-h-[340px] bg-cover bg-center lg:min-h-[500px]"
//             style={{
//               backgroundImage: `url(${business.galleryUrls[0]})`,
//             }}
//           >
//             <div className="absolute inset-0 bg-gradient-to-t from-[#071322d9] via-transparent to-transparent" />

//             <div className="absolute bottom-6 left-7 right-7 flex items-center justify-between text-xs text-white">
//               <span>Explore {business.location}</span>
//               <span>01 / 0{business.galleryUrls.length}</span>
//             </div>
//           </div>
//         </section>

//         <div className="grid gap-14 pt-16 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-20 lg:pt-20">
//           <div>
//             <section className="pb-16">
//               <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
//                 The story
//               </p>

//               <h2 className="mb-5 font-serif text-4xl font-normal tracking-tight sm:text-5xl">
//                 A place worth discovering.
//               </h2>

//               <p className="max-w-2xl text-base leading-8 text-slate-600">
//                 {business.description}
//               </p>
//             </section>

//             <section id="offers" className="pb-16">
//               <div className="mb-7 flex items-end justify-between gap-4">
//                 <div>
//                   <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
//                     Exclusive for readers
//                   </p>

//                   <h2 className="font-serif text-4xl font-normal tracking-tight">
//                     Live offers
//                   </h2>
//                 </div>

//                 <span className="whitespace-nowrap text-xs font-bold text-[#2f7d1b]">
//                   <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#7fbd43]" />
//                   Live now
//                 </span>
//               </div>

//               <div className="grid gap-4">
//                 {business.offers.map((offer) => (
//                   <article
//                     key={offer.title}
//                     className="grid overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg sm:grid-cols-[165px_1fr]"
//                   >
                 
//                     {offer.imageUrl && (
//                       <div
//                         className="relative min-h-[170px] bg-cover bg-center"
//                         style={{
//                           backgroundImage: `url(${offer.imageUrl})`,
//                         }}
//                       >
//                         <span className="absolute bottom-3 left-3 rounded bg-[#0b1830e8] px-2 py-1 text-[10px] text-white">
//                           Ends{" "}
//                           {offer.expiryDate
//                             ? new Date(offer.expiryDate).toLocaleDateString("en-IE", {
//                                 day: "2-digit",
//                                 month: "short",
//                               })
//                             : "—"}
//                         </span>
//                       </div>
//                     )}

//                     <div className="p-5">
//                       <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-[#2f7d1b]">
//                         Reader offer
//                       </p>

//                       <h3 className="font-serif text-2xl font-normal">
//                         {offer.title}
//                       </h3>

//                       <p className="mt-1 text-sm leading-6 text-slate-500">
//                         {offer.description}
//                       </p>

//                       <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
//                         <code className="rounded border border-dashed border-slate-300 px-2 py-1 text-[11px] text-slate-500">
//                           {offer.promoCode}
//                         </code>

//                         <button
//                           type="button"
//                           onClick={() => {
//                             track("offer_action");
//                             window.open(
//                               offer.ctaUrl,
//                               "_blank",
//                               "noopener,noreferrer",
//                             );
//                           }}
//                           className="text-xs font-bold text-[#2f7d1b] hover:text-[#246515]"
//                         >
//                           {offer.ctaText} →
//                         </button>
//                       </div>
//                     </div>
//                   </article>
//                 ))}
//               </div>
//             </section>

//             <section className="pb-16">
//               <div className="mb-7 flex items-end justify-between">
//                 <div>
//                   <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
//                     A closer look
//                   </p>

//                   <h2 className="font-serif text-4xl font-normal tracking-tight">
//                     Gallery
//                   </h2>
//                 </div>

//                 <span className="text-xs text-slate-400">
//                   0{activeImage + 1} / 0{business.galleryUrls.length}
//                 </span>
//               </div>

//               <div
//                 className="relative flex h-[290px] items-center justify-between overflow-hidden rounded-xl bg-cover bg-center px-4 sm:h-[390px]"
//                 style={{
//                   backgroundImage: `url(${business.galleryUrls[activeImage]})`,
//                 }}
//               >
//                 <div className="absolute inset-0 bg-black/10" />

//                 <button
//                   type="button"
//                   onClick={previousImage}
//                   aria-label="Previous image"
//                   className="relative grid h-10 w-10 place-items-center rounded-full bg-[#0b1830cc] text-xl text-white transition hover:bg-[#0b1830]"
//                 >
//                   ←
//                 </button>

//                 <button
//                   type="button"
//                   onClick={nextImage}
//                   aria-label="Next image"
//                   className="relative grid h-10 w-10 place-items-center rounded-full bg-[#0b1830cc] text-xl text-white transition hover:bg-[#0b1830]"
//                 >
//                   →
//                 </button>
//               </div>

//               <div className="mt-3 flex gap-2 overflow-x-auto">
//                 {business.galleryUrls.map((image, index) => (
//                   <button
//                     key={image}
//                     type="button"
//                     onClick={() => setActiveImage(index)}
//                     aria-label={`Show image ${index + 1}`}
//                     className={`h-16 w-24 shrink-0 rounded-md bg-cover bg-center transition ${
//                       activeImage === index
//                         ? "opacity-100 ring-2 ring-[#2f7d1b] ring-offset-2"
//                         : "opacity-50 hover:opacity-80"
//                     }`}
//                     style={{
//                       backgroundImage: `url(${image})`,
//                     }}
//                   />
//                 ))}
//               </div>
//             </section>
//           </div>

//           <aside id="contact" className="space-y-5">
//             <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
//               <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
//                 Plan your visit
//               </p>

//               <h2 className="font-serif text-4xl font-normal tracking-tight">
//                 Make it happen.
//               </h2>

//               <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
//                 <a
//                   href={business.website}
//                   onClick={() => track("website_click")}
//                   className="flex items-center gap-3 py-4 text-xs text-slate-600 hover:text-[#2f7d1b]"
//                 >
//                   <span className="text-base">◎</span>
//                   <span>Visit website</span>
//                   <span className="ml-auto">→</span>
//                 </a>

//                 <a
//                   href={`tel:${business.telephone}`}
//                   onClick={() => track("telephone_click")}
//                   className="flex items-center gap-3 py-4 text-xs text-slate-600 hover:text-[#2f7d1b]"
//                 >
//                   <span className="text-base">⌕</span>
//                   <span>{business.telephone}</span>
//                   <span className="ml-auto">→</span>
//                 </a>

//                 <a
//                   href={`mailto:${business.email}`}
//                   onClick={() => track("email_click")}
//                   className="flex items-center gap-3 py-4 text-xs text-slate-600 hover:text-[#2f7d1b]"
//                 >
//                   <span className="text-base">✉</span>
//                   <span className="break-all">{business.email}</span>
//                   <span className="ml-auto">→</span>
//                 </a>

//                 <a
//                   href={business.mapUrl}
//                   target="_blank"
//                   rel="noreferrer"
//                   onClick={() => track("map_click")}
//                   className="flex items-center gap-3 py-4 text-xs text-slate-600 hover:text-[#2f7d1b]"
//                 >
//                   <span className="text-base">⌖</span>
//                   <span>View on map</span>
//                   <span className="ml-auto">→</span>
//                 </a>
//               </div>

//               <a
//                 href={business.ctaUrl}
//                 target="_blank"
//                 rel="noreferrer"
//                 onClick={() => track("cta_click")}
//                 className="mt-6 flex min-h-12 items-center justify-center rounded-lg bg-[#2f7d1b] text-sm font-bold text-white transition hover:bg-[#246515]"
//               >
//                 {business.ctaText} →
//               </a>
//             </div>

//             <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//               <div
//                 className="relative h-48 bg-cover bg-center"
//                 style={{
//                   backgroundImage: `url(${business.galleryUrls[2]})`,
//                 }}
//               >
//                 <div className="absolute inset-0 grid place-items-center bg-black/20">
//                   <button
//                     type="button"
//                     onClick={() => track("promo_video_play")}
//                     aria-label="Play promotional video"
//                     className="grid h-14 w-14 place-items-center rounded-full bg-[#b9e757] text-xl text-[#0b1830] shadow-lg transition hover:scale-105"
//                   >
//                     ▶
//                   </button>
//                 </div>
//               </div>

//               <div className="p-5">
//                 <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
//                   See it for yourself
//                 </p>

//                 <h3 className="font-serif text-2xl font-normal">
//                   A weekend in {business.location}
//                 </h3>

//                 <p className="mt-2 text-xs leading-5 text-slate-500">
//                   Watch the story behind this local favourite.
//                 </p>
//               </div>
//             </div>

//             {/* Social links */}
//             <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
//               <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
//                 Follow along
//               </p>

        
//               <div className="mt-4 flex gap-2">
//                 {business.socialLinks &&
//                   Object.entries(business.socialLinks)
//                     .filter(([, url]) => Boolean(url))
//                     .map(([network, url]) => (
//                       <a
//                         key={network}
//                         href={url}
//                         target="_blank"
//                         rel="noreferrer"
//                         aria-label={network}
//                         className="grid h-10 w-10 place-items-center rounded-full bg-[#edf2ec] text-[#2f7d1b] transition hover:bg-[#dcebd6]"
//                       >
//                         <SocialIcon network={network} className="h-4 w-4" />
//                       </a>
//                     ))}
//               </div>
//             </div>
//           </aside>
//         </div>
//       </main>

//       <footer className="bg-[#0b1830] text-xs text-slate-400">
//         <div className="mx-auto flex w-[calc(100%-2rem)] max-w-[1180px] flex-col gap-2 py-7 sm:flex-row sm:items-center sm:justify-between">
//           <span className="font-serif text-lg text-white">Mara Media</span>

//           <span>
//             Discover more local stories ·{" "}
//             <a href="/browse" className="text-[#b9e757] hover:text-white">
//               Browse publications →
//             </a>
//           </span>
//         </div>
//       </footer>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";

// ...SocialIcon component unchanged...
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


export default function BusinessPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    consentGiven: false,
  });
  const [enquiryStatus, setEnquiryStatus] = useState("idle"); // idle | submitting | success | error
  const [enquiryError, setEnquiryError] = useState("");
  // "directory" when the visitor clicked through from a directory listing card
  const referralSource = searchParams.get("from");

  function track(eventType, extraMetadata, offerId) {
    if (!business) return;
    fetch("/api/track/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventType,
        businessProfileId: business.businessProfileId || business.id,
        publicationId: business.publicationId,
        offerId: offerId || null,
        metadata: extraMetadata || null,
      }),
    }).catch(() => {});
  }

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/business/${id}`);
      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      console.log("DATA")
      console.log(data)
      setBusiness(data.business);
      setLoading(false);

      const viewEventType =
        referralSource === "directory" ? "directory_profile_view" : "profile_view";

      fetch("/api/track/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          eventType: viewEventType,
          businessProfileId: data.business.businessProfileId || data.business.id,
          publicationId: data.business.publicationId,
        }),
      }).catch(() => {});
    }
    if (id) load();
  }, [id, referralSource]);

  function nextImage() {
    if (!business?.galleryUrls?.length) return;
    setActiveImage((current) =>
      current === business.galleryUrls.length - 1 ? 0 : current + 1,
    );
  }

  function previousImage() {
    if (!business?.galleryUrls?.length) return;
    setActiveImage((current) =>
      current === 0 ? business.galleryUrls.length - 1 : current - 1,
    );
  }

  async function submitEnquiry(e) {
    e.preventDefault();
    if (!business) return;

    if (!enquiryForm.consentGiven) {
      setEnquiryError("Please confirm you're happy for us to share your details with this business.");
      return;
    }

    setEnquiryStatus("submitting");
    setEnquiryError("");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessProfileId: business.businessProfileId || business.id,
          publicationId: business.publicationId,
          name: enquiryForm.name,
          email: enquiryForm.email,
          phone: enquiryForm.phone,
          message: enquiryForm.message,
          consentGiven: enquiryForm.consentGiven,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEnquiryStatus("error");
        setEnquiryError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setEnquiryStatus("success");
      track("enquiry_submitted");
    } catch {
      setEnquiryStatus("error");
      setEnquiryError("Something went wrong. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f8f6]">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f8f6]">
        <p className="text-sm text-slate-500">Business not found.</p>
      </div>
    );
  }

  const hasGallery = business.galleryUrls?.length > 0;
  const hasContactDetails =
    business.website || business.telephone || business.email || business.mapUrl;
  const hasSocialLinks =
    business.socialLinks &&
    Object.values(business.socialLinks).some((url) => Boolean(url));

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-[#0b1830]">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[48px] w-[calc(100%-2rem)] max-w-[1180px] items-center gap-2 overflow-x-auto whitespace-nowrap text-[11px] text-slate-500">
          <a href="/browse" className="hover:text-[#2f7d1b]">
            Publications
          </a>
          <span>/</span>
          <a href="/browse" className="hover:text-[#2f7d1b]">
            Discover Ireland
          </a>
          <span>/</span>
          <span className="font-semibold text-[#0b1830]">
            {business.category}
          </span>
        </div>
      </div>

      <main className="mx-auto w-[calc(100%-2rem)] max-w-[1180px] pb-20">
        <section
          className={`mt-7 grid overflow-hidden rounded-2xl bg-[#0b1830] text-white shadow-[0_18px_45px_rgba(11,24,48,0.18)] lg:grid-cols-[0.9fr_1.1fr] ${
            business.featured
              ? "ring-1 ring-[#c8ab60] ring-offset-4"
              : ""
          }`}
        >
          <div className="flex flex-col justify-center px-7 py-10 sm:px-12 sm:py-14 lg:px-14 lg:py-16">
            <div className="mb-7 flex flex-wrap gap-2">
              {business.featured && (
                <span className="rounded-full bg-[#d8ba62] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#1a291d]">
                  ✦ Featured
                </span>
              )}

              <span className="rounded-full bg-[#29445c] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-200">
                Digital partner
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#f0eee6] font-serif text-4xl font-bold text-[#2f7d1b]">
                {business.logoUrl ? (
                  <img
                    src={business.logoUrl}
                    alt={business.businessName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  business.businessName?.[0]?.toUpperCase()
                )}
              </div>

              <div>
                <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9aabba]">
                  {business.category}
                </p>

                <h1 className="font-serif text-4xl leading-none tracking-tight sm:text-5xl">
                  {business.businessName}
                </h1>
              </div>
            </div>

            {business.location && (
              <p className="mt-5 flex items-center gap-2 text-sm text-[#b9c8d3]">
                <span className="text-base">⌖</span>
                {business.location}
              </p>
            )}

            {business.shortDescription && (
              <p className="mt-5 max-w-lg text-base leading-7 text-[#d4dfe6]">
                {business.shortDescription}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {business.offers?.length > 0 && (
                <a
                  href="#offers"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#b9e757] px-5 text-sm font-bold text-[#152313] transition hover:-translate-y-0.5 hover:bg-[#c8f36d]"
                >
                  View live offers
                  <span>→</span>
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

          <div
            className="relative min-h-[340px] bg-cover bg-center lg:min-h-[500px]"
            style={{
              backgroundImage: hasGallery ? `url(${business.galleryUrls[0]})` : undefined,
            }}
          >
            {!hasGallery && <div className="absolute inset-0 bg-[#132a45]" />}
            <div className="absolute inset-0 bg-gradient-to-t from-[#071322d9] via-transparent to-transparent" />

            <div className="absolute bottom-6 left-7 right-7 flex items-center justify-between text-xs text-white">
              <span>Explore {business.location}</span>
              {hasGallery && <span>01 / 0{business.galleryUrls.length}</span>}
            </div>
          </div>
        </section>

        <div className="grid gap-14 pt-16 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-20 lg:pt-20">
          <div>
            {business.description && (
              <section className="pb-16">
                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
                  The story
                </p>

                <h2 className="mb-5 font-serif text-4xl font-normal tracking-tight sm:text-5xl">
                  A place worth discovering.
                </h2>

                <p className="max-w-2xl text-base leading-8 text-slate-600">
                  {business.description}
                </p>
              </section>
            )}

            {business.offers?.length > 0 && (
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
                  {business.offers.map((offer) => (
                    <article
                      key={offer.title}
                      className="grid overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg sm:grid-cols-[165px_1fr]"
                    >
                      {offer.imageUrl && (
                        <div
                          className="relative min-h-[170px] bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${offer.imageUrl})`,
                          }}
                        >
                          <span className="absolute bottom-3 left-3 rounded bg-[#0b1830e8] px-2 py-1 text-[10px] text-white">
                            Ends{" "}
                            {offer.expiryDate
                              ? new Date(offer.expiryDate).toLocaleDateString("en-IE", {
                                  day: "2-digit",
                                  month: "short",
                                })
                              : "—"}
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

{offer.ctaUrl && offer.ctaText && (
                            <button
                              type="button"
                              onClick={() => {
                                track("offer_action", null, offer.id);
                                const url = /^https?:\/\//i.test(offer.ctaUrl)
                                  ? offer.ctaUrl
                                  : `https://${offer.ctaUrl}`;
                                window.open(url, "_blank", "noopener,noreferrer");
                              }}
                              className="text-xs cursor-pointer font-bold text-[#2f7d1b] hover:text-[#246515]"
                            >
                              {offer.ctaText} →
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {hasGallery && (
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
                    0{activeImage + 1} / 0{business.galleryUrls.length}
                  </span>
                </div>

                <div
                  className="relative flex h-[290px] items-center justify-between overflow-hidden rounded-xl bg-cover bg-center px-4 sm:h-[390px]"
                  style={{
                    backgroundImage: `url(${business.galleryUrls[activeImage]})`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/10" />

                  {business.galleryUrls.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={previousImage}
                        aria-label="Previous image"
                        className="relative cursor-pointer grid h-10 w-10 place-items-center rounded-full bg-[#0b1830cc] text-xl text-white transition hover:bg-[#0b1830]"
                      >
                        ←
                      </button>

                      <button
                        type="button"
                        onClick={nextImage}
                        aria-label="Next image"
                        className="relative cursor-pointer grid h-10 w-10 place-items-center rounded-full bg-[#0b1830cc] text-xl text-white transition hover:bg-[#0b1830]"
                      >
                        →
                      </button>
                    </>
                  )}
                </div>

                {business.galleryUrls.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {business.galleryUrls.map((image, index) => (
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
                        style={{
                          backgroundImage: `url(${image})`,
                        }}
                      />
                    ))}
                  </div>
                )}
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
                {business.website && (
                  <a
                    href={business.website}
                    onClick={() => track("website_click")}
                    className="flex items-center gap-3 py-4 text-xs text-slate-600 hover:text-[#2f7d1b]"
                  >
                    <span className="text-base">◎</span>
                    <span>Visit website</span>
                    <span className="ml-auto">→</span>
                  </a>
                )}

                {business.telephone && (
                  <a
                    href={`tel:${business.telephone}`}
                    onClick={() => track("telephone_click")}
                    className="flex items-center gap-3 py-4 text-xs text-slate-600 hover:text-[#2f7d1b]"
                  >
                    <span className="text-base">⌕</span>
                    <span>{business.telephone}</span>
                    <span className="ml-auto">→</span>
                  </a>
                )}

                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    onClick={() => track("email_click")}
                    className="flex items-center gap-3 py-4 text-xs text-slate-600 hover:text-[#2f7d1b]"
                  >
                    <span className="text-base">✉</span>
                    <span className="break-all">{business.email}</span>
                    <span className="ml-auto">→</span>
                  </a>
                )}

                {business.mapUrl && (
                  <a
                    href={business.mapUrl}
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

                {!hasContactDetails && (
                  <p className="px-5 py-6 text-center text-xs text-slate-400">
                    No contact details available yet.
                  </p>
                )}
              </div>

              {business.ctaUrl && business.ctaText && (
                <a
                href={business.ctaUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => track("advert_click")}
                className="mt-6 flex min-h-12 items-center justify-center rounded-lg bg-[#2f7d1b] text-sm font-bold text-white transition hover:bg-[#246515]"
              >
                {business.ctaText} →
              </a>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
              Get in touch
            </p>
            <h2 className="font-serif text-3xl font-normal tracking-tight">
              Send an enquiry.
            </h2>

            {enquiryStatus === "success" ? (
              <p className="mt-4 rounded-lg bg-[#edf5df] px-4 py-3 text-sm text-[#2f7d1b]">
                Thanks — your enquiry has been sent to {business.businessName}.
              </p>
            ) : (
              <form onSubmit={submitEnquiry} className="mt-4 space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={enquiryForm.name}
                  onChange={(e) => setEnquiryForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
                />

                <input
                  type="email"
                  required
                  placeholder="Your email"
                  value={enquiryForm.email}
                  onChange={(e) => setEnquiryForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
                />

                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
                />

                <textarea
                  placeholder="What would you like to ask?"
                  rows={3}
                  value={enquiryForm.message}
                  onChange={(e) => setEnquiryForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2f7d1b] focus:outline-none"
                />

                <label className="flex items-start gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={enquiryForm.consentGiven}
                    onChange={(e) =>
                      setEnquiryForm((f) => ({ ...f, consentGiven: e.target.checked }))
                    }
                    className="mt-0.5"
                  />
                  <span>
                    I agree to my details being shared with {business.businessName} so
                    they can respond to my enquiry.
                  </span>
                </label>

                {enquiryError && (
                  <p className="text-xs text-red-500">{enquiryError}</p>
                )}

                <button
                  type="submit"
                  disabled={enquiryStatus === "submitting"}
                  className="mt-2 cursor-pointer flex min-h-11 w-full items-center justify-center rounded-lg bg-[#2f7d1b] text-sm font-bold text-white transition hover:bg-[#246515] disabled:opacity-60"
                >
                  {enquiryStatus === "submitting" ? "Sending…" : "Send enquiry"}
                </button>
              </form>
            )}
          </div>

           {business.promoVideoUrl && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <video
                  src={business.promoVideoUrl}
                  controls
                  className="h-48 w-full bg-black object-cover"
                  onPlay={() => track("video_view")}
                />
                <div className="p-5">
                  <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
                    See it for yourself
                  </p>
                  <h3 className="font-serif text-2xl font-normal">
                    {business.location ? `A weekend in ${business.location}` : "Watch the video"}
                  </h3>
                </div>
              </div>
            )}
            
            {hasSocialLinks && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#2f7d1b]">
                  Follow along
                </p>

                <div className="mt-4 flex gap-2">
                  {Object.entries(business.socialLinks)
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
            <a href="/browse" className="text-[#b9e757] hover:text-white">
              Browse publications →
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}