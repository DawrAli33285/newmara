import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getListingsData() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.accountType !== "business") {
    return null;
  }

  const business = await prisma.business.findUnique({
    where: { id: session.user.id },
    select: {
      advertiser: { select: { id: true } },
      directoryListings: { select: { id: true }, take: 1 },
      businessProfile: {
        select: {
          digitalPartner: { select: { isActive: true, paymentStatus: true } },
        },
      },
    },
  });

  if (!business) return null;

  const latestSubscription = await prisma.businessSubscription.findFirst({
    where: { businessId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const isSubscriptionActive =
    latestSubscription && ["active", "trialing"].includes(latestSubscription.status);
    

  const listings = await prisma.directoryListing.findMany({
    where: { businessId: session.user.id },
    include: {
      publications: { select: { id: true, title: true } },
      _count: { select: { events: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  
  const allPublicationIds = listings.flatMap((l) => l.publications.map((p) => p.id));
  
  const assignments = await prisma.businessAssignment.findMany({
    where: {
      businessId: session.user.id,
      packageType: "directory",
      publicationId: { in: allPublicationIds },
    },
    include: {
      destination: { select: { name: true } },
      category: { select: { name: true } },
    },
  });
  
  const assignmentsByPublication = new Map();
  for (const a of assignments) {
    const list = assignmentsByPublication.get(a.publicationId) || [];
    list.push(a);
    assignmentsByPublication.set(a.publicationId, list);
  }
  
  const listingsWithAssignments = listings.map((listing) => ({
    ...listing,
    publicationAssignments: listing.publications.map((pub) => ({
      publication: pub,
      assignments: assignmentsByPublication.get(pub.id) || [],
    })),
  }));

  const listingIds = listings.map((l) => l.id);

  const clickCounts = await prisma.engagementEvent.groupBy({
    by: ["eventType"],
    where: {
      directoryListingId: { in: listingIds },
      eventType: { in: ["website_click", "telephone_click"] },
    },
    _count: { _all: true },
  });

  const websiteClicks = clickCounts.find((c) => c.eventType === "website_click")?._count._all || 0;
  const telephoneClicks = clickCounts.find((c) => c.eventType === "telephone_click")?._count._all || 0;
  
  return { business, listings: listingsWithAssignments, websiteClicks, telephoneClicks };
}
const STATUS_META = {
  draft:       { label: "Draft",       dot: "bg-slate-400",  text: "text-slate-600",  bg: "bg-slate-50"  },
  submitted:   { label: "Submitted",   dot: "bg-amber-500",  text: "text-amber-700",  bg: "bg-amber-50"  },
  mara_review: { label: "In review",   dot: "bg-amber-500",  text: "text-amber-700",  bg: "bg-amber-50"  },
  approved:    { label: "Approved",    dot: "bg-blue-500",   text: "text-blue-700",   bg: "bg-blue-50"   },
  scheduled:   { label: "Scheduled",   dot: "bg-blue-500",   text: "text-blue-700",   bg: "bg-blue-50"   },
  live:        { label: "Live",        dot: "bg-[#2f7d1b]",  text: "text-[#246515]",  bg: "bg-[#edf6e5]" },
  expired:     { label: "Expired",     dot: "bg-slate-400",  text: "text-slate-500",  bg: "bg-slate-50"  },
  denied:      { label: "Denied",      dot: "bg-red-500",    text: "text-red-700",    bg: "bg-red-50"    },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status] || { label: status, dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-50" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.bg} ${meta.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function Eye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" />
    </svg>
  );
}

function Pin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default async function DirectoryListingsPage() {
  const data = await getListingsData();
  if (data === null) redirect("/business/login");

  const { business, listings, websiteClicks, telephoneClicks } = data;

  const digitalPartner = business?.businessProfile?.digitalPartner;
  const hasActiveDigitalPartner =
    digitalPartner?.isActive && digitalPartner?.paymentStatus === "active";
  const hasAdvertiser = Boolean(business?.advertiser);
  const hasDirectoryListing = listings.length > 0;

  if (hasActiveDigitalPartner) {
    redirect("/business/dashboard");
  }
  if (!hasDirectoryListing) {
    if (hasAdvertiser) {
      redirect("/business/advertiserdashboard");
    }
    redirect("/business/select-plan");
  }

  const listing = listings[0];

  const publicationCount = listing ? listing.publications.length : 0;
  
  const destinationCount = listing
  ? new Set(
      listing.publicationAssignments
        .flatMap((pa) => pa.assignments)
        .map((a) => a.destination?.name)
        .filter(Boolean)
    ).size
  : 0;


  
  const totalViews = listings.reduce((sum, l) => sum + (l._count?.events || 0), 0);


  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
    
        <div className="mb-6 sm:mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2f7d1b]">Directory</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#0b1830] sm:text-3xl">
            Your listings
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Manage where your business appears in the directory.
          </p>
        </div>

        
        <div className="mb-6 grid grid-cols-3 gap-3 sm:mb-8 sm:grid-cols-5">
  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
    <p className="text-[11px] font-semibold text-slate-400">Publications</p>
    <p className="mt-0.5 text-xl font-bold text-[#0b1830]">{publicationCount}</p>
  </div>
  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
    <p className="text-[11px] font-semibold text-slate-400">Destinations</p>
    <p className="mt-0.5 text-xl font-bold text-[#2f7d1b]">{destinationCount}</p>
  </div>
  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
    <p className="text-[11px] font-semibold text-slate-400">Total views</p>
    <p className="mt-0.5 text-xl font-bold text-[#0b1830]">{totalViews}</p>
  </div>
  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
    <p className="text-[11px] font-semibold text-slate-400">Website clicks</p>
    <p className="mt-0.5 text-xl font-bold text-[#0b1830]">{websiteClicks}</p>
  </div>
  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
    <p className="text-[11px] font-semibold text-slate-400">Phone clicks</p>
    <p className="mt-0.5 text-xl font-bold text-[#0b1830]">{telephoneClicks}</p>
  </div>
</div>


        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <p className="text-sm text-slate-500">No directory listings yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#2f7d1b]/30 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
  <p className="truncate font-bold text-[#0b1830]">{listing.businessName}</p>
  <div className="min-w-0">
  <p className="truncate font-bold text-[#0b1830]">{listing.businessName}</p>
  <div className="mt-0.5 flex flex-wrap gap-x-1.5 gap-y-0.5 text-xs text-slate-500">
    {listing.publicationAssignments.map((pa, i) => {
      const destinationNames = pa.assignments
        .map((a) => a.destination?.name)
        .filter(Boolean)
        .join(", ");
      const categoryName = pa.assignments[0]?.category?.name;

      return (
        <span key={pa.publication.id} className="truncate">
          {categoryName} · {pa.publication.title}
          {destinationNames ? ` · ${destinationNames}` : ""}
          {i < listing.publicationAssignments.length - 1 ? "," : ""}
        </span>
      );
    })}
  </div>
</div>
</div>

                  <StatusPill status={listing.status} />
                </div>

                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Eye />
                      {listing._count.events} view{listing._count.events === 1 ? "" : "s"}
                    </span>
                    {listing.location && (
  <span className="hidden items-center gap-1.5 sm:flex">
    <Pin />
    {listing.location}
  </span>
)}
                  </div>

                  <div className="flex items-center gap-4">
                    <Link
                      href={`/directory/${listing.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-slate-500 transition hover:text-[#0b1830]"
                    >
                      View
                    </Link>
                    <Link
                      href={`/business/directory-listings/${listing.id}`}
                      className="text-xs font-bold text-[#2f7d1b] transition hover:text-[#246515]"
                    >
                      Edit →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}