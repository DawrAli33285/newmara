import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import AdRequestForm from "@/components/AdRequestForm";

export const dynamic = "force-dynamic";

const STATUS_LABEL = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_COLOR = {
  pending: "bg-amber-50 border-amber-200 text-amber-700",
  approved: "bg-emerald-50 border-emerald-200 text-emerald-700",
  rejected: "bg-red-50 border-red-200 text-red-700",
};

export default async function BusinessPublicationAdsPage({ params }) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.accountType !== "business") {
    redirect("/login");
  }

  const publication = await prisma.publication.findUnique({
    where: { slug },
  });

  if (!publication) {
    return notFound();
  }

  const advertiser = await prisma.advertiser.findUnique({
    where: { businessId: session.user.id },
    select: { id: true, advertiserName: true },
  });

  if (!advertiser) {

    return (
      <div className="min-h-screen bg-gray-50 text-[#0b1830]">
        <main className="mx-auto max-w-3xl p-5 sm:p-8">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            Your business account isn&apos;t linked to an advertiser profile
            yet, so you can&apos;t submit ads. Please contact your account
            manager.
          </div>
        </main>
      </div>
    );
  }

  const activeSubscription = await prisma.businessSubscription.findFirst({
    where: {
      businessId: session.user.id,
      status: { in: ["active", "trialing"] },
    },
    include: { printPackage: true },
    orderBy: { createdAt: "desc" },
  });

  const entitlements = activeSubscription?.printPackage?.entitlements || {};
  const allowsVideo = Boolean(entitlements.video);
  const allowsLink = Boolean(entitlements.link);
console.log("ALLOWS")
  console.log(allowsLink)

  const ads = await prisma.ad.findMany({
    where: {
      advertiserId: advertiser.id,
      publicationId: publication.id,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      linkType: true,
      linkUrl: true,
      label: true,
      priceCents: true,
      status: true,
      rejectionReason: true,
      clickCount: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 text-[#0b1830]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
          <Link
            href="/business/adpage"
            className="text-sm text-gray-500 hover:text-[#2f7d1b]"
          >
            ← Back to publications
          </Link>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f7d1b]">
                Ad editor
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                {publication.title}
              </h1>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              Submit for admin approval
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-5 sm:p-8 space-y-6">
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-6 text-blue-900">
          Upload a PDF and choose a link or video to attach to it. Your ad
          goes to the Mara Media team for review — once approved, it becomes
          available for readers to unlock.
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Your ads</h2>

          {ads.length === 0 ? (
            <p className="text-sm text-gray-400">
              You haven&apos;t submitted any ads for this publication yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {ads.map((ad) => (
                <li key={ad.id}>
                  <Link
                    href={`/business/adpage/${slug}/${ad.id}`}
                    className={`block rounded-lg border px-3 py-2.5 text-sm transition hover:opacity-90 ${
                      STATUS_COLOR[ad.status] || "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">
                        {ad.linkType === "video" ? "▶ Video" : "🔗 Link"}
                        {ad.label ? ` — ${ad.label}` : ""}
                      </p>
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {STATUS_LABEL[ad.status] || ad.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs opacity-80 truncate">
                      {ad.linkUrl}
                    </p>
                    <p className="mt-1 text-xs opacity-70">
                      ${(ad.priceCents / 100).toFixed(2)}
                      {ad.status === "rejected" && ad.rejectionReason
                        ? ` · ${ad.rejectionReason}`
                        : ""}
                      {" · "}
                      {ad.clickCount} click{ad.clickCount === 1 ? "" : "s"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <AdRequestForm
            publicationSlug={publication.slug}
            advertiserName={advertiser.advertiserName}
            allowsVideo={allowsVideo}
            allowsLink={allowsLink}
          />
        </div>
      </main>
    </div>
  );
}