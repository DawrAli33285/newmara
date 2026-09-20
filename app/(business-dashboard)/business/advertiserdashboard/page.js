import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getAdvertiserData() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.accountType !== "business") {
    return null;
  }

  const latestSubscription = await prisma.businessSubscription.findFirst({
    where: { businessId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const isSubscriptionActive =
    latestSubscription && ["active", "trialing"].includes(latestSubscription.status);

  const business = await prisma.business.findUnique({
    where: { id: session.user.id },
    select: {
      businessName: true,
      advertiser: { select: { id: true, advertiserName: true, telephone: true } },
      directoryListings: { select: { id: true }, take: 1 },
      businessProfile: {
        select: {
          digitalPartner: { select: { isActive: true, paymentStatus: true } },
        },
      },
    },
  });

  if (!business?.advertiser) return { business, advertiser: null, isSubscriptionActive };

  const ads = await prisma.ad.findMany({
    where: { advertiserId: business.advertiser.id },
    include: {
      publication: { select: { title: true, coverImageUrl: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return { business, advertiser: business.advertiser, ads, isSubscriptionActive };
}

const STATUS_LABEL = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_COLOR = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

export default async function AdvertiserDashboardPage() {
  const data = await getAdvertiserData();
  if (!data) redirect("/business/login");

  const { business, advertiser, ads = [], isSubscriptionActive } = data;

  if (!isSubscriptionActive) {
    redirect("/business/select-plan");
  }

  if (!advertiser) {
    const digitalPartner = business?.businessProfile?.digitalPartner;
    const hasActiveDigitalPartner =
      digitalPartner?.isActive && digitalPartner?.paymentStatus === "active";
    const hasDirectoryListing = (business?.directoryListings?.length ?? 0) > 0;

    if (hasActiveDigitalPartner) {
      redirect("/business/dashboard");
    }
    if (hasDirectoryListing) {
      redirect("/business/listingdashboard");
    }

    return (
      <main className="mx-auto max-w-3xl space-y-6 p-5 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f7d1b]">Advertiser</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">No advertiser account yet</h1>
        <p className="text-sm text-slate-500">
          {business?.businessName} isn't set up as an advertiser. Contact Mara to book an advertising package.
        </p>
      </main>
    );
  }

  const approved = ads.filter((a) => a.status === "approved");
  const pending = ads.filter((a) => a.status === "pending");
  const rejected = ads.filter((a) => a.status === "rejected");
  const totalClicks = ads.reduce((sum, a) => sum + (a.clickCount || 0), 0);

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f7d1b]">Advertiser overview</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{advertiser.advertiserName}</h1>
        <p className="mt-2 text-sm text-slate-500">Manage your ads and track their performance.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Approved ads</p>
          <p className="mt-3 text-3xl font-bold text-green-700">{approved.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Pending review</p>
          <p className="mt-3 text-3xl font-bold text-amber-700">{pending.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Rejected</p>
          <p className="mt-3 text-3xl font-bold text-red-700">{rejected.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Total clicks</p>
          <p className="mt-3 text-3xl font-bold text-[#2f7d1b]">{totalClicks}</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your ads</h2>
          <Link
            href="/business/adpage"
            className="text-xs font-semibold text-[#2f7d1b] hover:underline"
          >
            Manage ads →
          </Link>
        </div>

        <div className="mt-5 divide-y divide-slate-100">
          {ads.length === 0 && (
            <p className="py-4 text-sm text-slate-500">
              You haven&apos;t submitted any ads yet.
            </p>
          )}

          {ads.map((ad) => (
            <Link
              key={ad.id}
              href={`/business/adpage/${ad.publication.slug}/${ad.id}`}
              className="flex items-center justify-between gap-4 py-4 hover:opacity-80"
            >
              <div>
                <p className="font-semibold text-[#0b1830]">
                  {ad.publication.title}
                  {ad.label ? ` — ${ad.label}` : ""}
                </p>
                <p className="text-xs text-slate-500">
                  {ad.linkType === "video" ? "▶ Video" : "🔗 Link"} ·{" "}
                  {new Date(ad.createdAt).toLocaleDateString("en-IE")} ·{" "}
                  {ad.clickCount} click{ad.clickCount === 1 ? "" : "s"}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  STATUS_COLOR[ad.status] || "bg-slate-100 text-slate-500"
                }`}
              >
                {STATUS_LABEL[ad.status] || ad.status}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}