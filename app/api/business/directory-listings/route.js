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
      advertiser: { select: { id: true } },
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

  const listings = await prisma.directoryListing.findMany({
    where: { businessId: session.user.id },
    include: {
      publication: { select: { title: true } },
      destination: { select: { name: true } },
      _count: { select: { events: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const digitalPartner = business.businessProfile?.digitalPartner;
  const hasActiveDigitalPartner =
    digitalPartner?.isActive && digitalPartner?.paymentStatus === "active";
  const hasAdvertiser = Boolean(business.advertiser);

  return NextResponse.json({
    listings,
    hasActiveDigitalPartner,
    hasAdvertiser,
    hasDirectoryListing: listings.length > 0,
  });
}