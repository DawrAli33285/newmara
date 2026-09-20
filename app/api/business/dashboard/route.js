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
        advertiser: { select: { id: true } },
        directoryListings: { select: { id: true }, take: 1 },
        businessProfile: {
          select: {
            id: true,
            digitalPartner: {
              select: { id: true, isActive: true, paymentStatus: true },
            },
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const digitalPartner = business.businessProfile?.digitalPartner;
    const hasDigitalPartner = Boolean(digitalPartner);
    const hasAdvertiser = Boolean(business.advertiser);
    const hasDirectoryListing = business.directoryListings.length > 0;

    if (!hasDigitalPartner) {
      return NextResponse.json(
        { hasDigitalPartner: false, hasAdvertiser, hasDirectoryListing },
        { status: 200 }
      );
    }

    if (!digitalPartner.isActive || digitalPartner.paymentStatus !== "active") {
      return NextResponse.json(
        { hasDigitalPartner: false, inactive: true },
        { status: 200 }
      );
    }

    const businessProfileId = business.businessProfile.id;

    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const [
      profileViews,
      advertClicks,
      websiteClicks,
      enquiriesCount,
      offerActions,
      dailyEvents,
      activeOffers,
      latestIssue,
    ] = await Promise.all([
      prisma.engagementEvent.count({
        where: { businessProfileId, eventType: "profile_view" },
      }),
      prisma.engagementEvent.count({
        where: { businessProfileId, eventType: "advert_click" },
      }),
      prisma.engagementEvent.count({
        where: { businessProfileId, eventType: "website_click" },
      }),
      prisma.enquiry.count({
        where: {
          businessProfileId,
          createdAt: { gte: new Date(new Date().setDate(1)) },
        },
      }),
      prisma.engagementEvent.groupBy({
        by: ["eventType"],
        where: {
          businessProfileId,
          eventType: {
            in: ["website_click", "map_click", "telephone_click", "email_click", "video_view"],
          },
        },
        _count: { eventType: true },
      }),
      prisma.engagementEvent.findMany({
        where: { businessProfileId, createdAt: { gte: since } },
        select: { eventType: true, createdAt: true },
      }),
      prisma.offer.findMany({
        where: { businessProfileId, status: "live" },
        select: {
          id: true,
          title: true,
          events: {
            select: { eventType: true },
          },
        },
      }),
      prisma.issue.findFirst({
        where: {
          isPublished: true,
          publication: {
            digitalPartnerPublications: {
              some: { digitalPartnerId: business.businessProfile.digitalPartner.id },
            },
          },
        },
        orderBy: { publishedAt: "desc" },
        select: {
          title: true,
          issueNumber: true,
          publishedAt: true,
          isPublished: true,
          totalPages: true,
          publication: { select: { title: true } },
        },
      }),
      ]);
    
    const dayBuckets = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-IE", { day: "2-digit", month: "short" });
      dayBuckets[key] = { day: key, profile: 0, advert: 0, website: 0 };
    }

    const dayKeyFor = (date) =>
      new Date(date).toLocaleDateString("en-IE", { day: "2-digit", month: "short" });

    for (const ev of dailyEvents) {
      const key = dayKeyFor(ev.createdAt);
      if (!dayBuckets[key]) continue;
      if (ev.eventType === "profile_view") dayBuckets[key].profile += 1;
      if (ev.eventType === "advert_click") dayBuckets[key].advert += 1;
      if (ev.eventType === "website_click") dayBuckets[key].website += 1;
    }

    const actionBreakdownMap = {
      website_click: "Website clicks",
      map_click: "Map clicks",
      telephone_click: "Phone clicks",
      email_click: "Email clicks",
      video_view: "Video views",
    };

    const actionBreakdown = offerActions.map((row) => ({
      label: actionBreakdownMap[row.eventType] || row.eventType,
      value: row._count.eventType,
    }));

    const offers = activeOffers.map((offer) => {
      const views = offer.events.filter((e) => e.eventType === "offer_view").length;
      const actions = offer.events.filter((e) => e.eventType === "offer_action").length;
      return { id: offer.id, name: offer.title, views, actions };
    });

    return NextResponse.json({
      hasDigitalPartner: true,
      businessName: business.businessName,
      isDigitalPartnerAndAdvertiser: hasAdvertiser,
      metrics: {
        profileViews,
        advertClicks,
        websiteClicks,
        enquiriesCount,
      },
      activityData: Object.values(dayBuckets),
      actionBreakdown,
      offers,
      latestIssue: latestIssue
      ? {
          publicationTitle: latestIssue.publication?.title,
          issueTitle: latestIssue.title,
          issueNumber: latestIssue.issueNumber,
          publishedAt: latestIssue.publishedAt,
          isPublished: latestIssue.isPublished,
          pageCount: latestIssue.totalPages || null,
        }
      : null,
    });
  }