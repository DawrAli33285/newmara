import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.accountType !== "business") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  if (!business.advertiser) {
    const digitalPartner = business.businessProfile?.digitalPartner;
    const hasActiveDigitalPartner =
      digitalPartner?.isActive && digitalPartner?.paymentStatus === "active";
    const hasDirectoryListing = business.directoryListings.length > 0;

    return NextResponse.json({
      hasAdvertiser: false,
      businessName: business.businessName,
      hasActiveDigitalPartner,
      hasDirectoryListing,
    });
  }

  const [printBookings, payments] = await Promise.all([
    prisma.printBooking.findMany({
      where: { advertiserId: business.advertiser.id },
      include: {
        publication: { select: { title: true, coverImageUrl: true } },
        package: { select: { name: true, priceCents: true } },
      },
      orderBy: { startDate: "desc" },
    }),
    prisma.advertiserPayment.findMany({
      where: { advertiserId: business.advertiser.id },
      include: { publication: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const now = new Date();
  const active = printBookings.filter((b) => !b.expiryDate || new Date(b.expiryDate) > now);
  const expired = printBookings.filter((b) => b.expiryDate && new Date(b.expiryDate) <= now);
  const totalPaidCents = payments
    .filter((p) => p.status === "succeeded" || p.status === "paid")
    .reduce((sum, p) => sum + p.amountCents, 0);

  return NextResponse.json({
    hasAdvertiser: true,
    advertiser: business.advertiser,
    printBookings,
    payments,
    metrics: {
      activeCount: active.length,
      expiredCount: expired.length,
      totalPaidCents,
    },
  });
}