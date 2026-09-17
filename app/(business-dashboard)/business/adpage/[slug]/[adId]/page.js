import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import AdEditForm from "@/components/AdEditForm";

export const dynamic = "force-dynamic";

export default async function BusinessAdDetailPage({ params }) {
  const { slug, adId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.accountType !== "business") {
    redirect("/login");
  }
console.log("HI")
  const publication = await prisma.publication.findUnique({
    where: { slug },
  });

  console.log("DEBUG publication:", { slug, found: !!publication });

  if (!publication) {
    return notFound();
  }

  const advertiser = await prisma.advertiser.findUnique({
    where: { businessId: session.user.id },
    select: { id: true },
  });

  if (!advertiser) {
    redirect(`/business/adpage/${slug}`);
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

  const ad = await prisma.ad.findUnique({
    where: { id: adId },
  });


  console.log("DEBUG ad:", {
    adId,
    adFound: !!ad,
    adAdvertiserId: ad?.advertiserId,
    sessionAdvertiserId: advertiser.id,
    adPublicationId: ad?.publicationId,
    publicationId: publication.id,
  });

  if (
    !ad ||
    ad.advertiserId !== advertiser.id ||
    ad.publicationId !== publication.id
  ) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 text-[#0b1830]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8">
          <Link
            href={`/business/adpage/${slug}`}
            className="text-sm text-gray-500 hover:text-[#2f7d1b]"
          >
            ← Back to {publication.title}
          </Link>

          <h1 className="mt-4 text-2xl font-bold">Edit ad</h1>
          <p className="mt-1 text-sm text-gray-500">
            Changes are re-submitted for admin approval.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-5 sm:p-8">
        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <AdEditForm
            publicationSlug={slug}
            allowsVideo={allowsVideo}
            allowsLink={allowsLink}
            ad={{
              id: ad.id,
              linkType: ad.linkType,
              linkUrl: ad.linkUrl,
              label: ad.label,
              priceCents: ad.priceCents,
              status: ad.status,
              rejectionReason: ad.rejectionReason,
              pdfFileName: ad.pdfFileName,
              clickCount: ad.clickCount,
            }}
          />
          
        </div>
      </main>
    </div>
  );
}