// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// // GET /api/admin/analytics/overview?range=30d&publicationId=xxx
// //
// // Consolidated cross-advertiser totals for the admin dashboard.
// // Real implementation should aggregate EngagementEvent + Enquiry with
// // Prisma groupBy, scoped by createdAt range and optional publicationId.

// function rangeToDate(range) {
//   const now = new Date();
//   const days = { "7d": 7, "30d": 30, "90d": 90 }[range];
//   if (!days) return null; // "all"
//   return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
// }

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const range = searchParams.get("range") || "30d";
//   const publicationId = searchParams.get("publicationId") || undefined;
//   const since = rangeToDate(range);

//   try {
//     const where = {
//       ...(since && { createdAt: { gte: since } }),
//       ...(publicationId && { publicationId }),
//     };

//     const [
//       profileViews,
//       clickEvents,
//       videoViews,
//       offerActions,
//       enquiries,
//       activeDigitalPartners,
//       eventsByBusiness,
//       eventsByPublication,
//       enquiryFunnelRaw,
//     ] = await Promise.all([
//       prisma.engagementEvent.count({
//         where: {
//           ...where,
//           eventType: { in: ["profile_view", "directory_profile_view"] },
//         },
//       }),
//       prisma.engagementEvent.count({
//         where: {
//           ...where,
//           eventType: { in: ["advert_click", "website_click", "telephone_click", "email_click", "map_click"] },
//         },
//       }),
//       prisma.engagementEvent.count({ where: { ...where, eventType: "video_view" } }),
//       prisma.engagementEvent.count({ where: { ...where, eventType: "offer_action" } }),
//       prisma.enquiry.count({ where: { ...(since && { createdAt: { gte: since } }), ...(publicationId && { publicationId }) } }),
//       prisma.digitalPartner.count({ where: { isActive: true } }),
//       prisma.engagementEvent.groupBy({
//         by: ["businessProfileId"],
//         where: { ...where, businessProfileId: { not: null } },
//         _count: { _all: true },
//         orderBy: { _count: { businessProfileId: "desc" } },
//         take: 8,
//       }),
//       prisma.engagementEvent.groupBy({
//         by: ["publicationId"],
//         where: { ...where, publicationId: { not: null } },
//         _count: { _all: true },
//         orderBy: { _count: { publicationId: "desc" } },
//         take: 8,
//       }),
//       prisma.enquiry.groupBy({
//         by: ["status"],
//         where: { ...(since && { createdAt: { gte: since } }), ...(publicationId && { publicationId }) },
//         _count: { _all: true },
//       }),
//     ]);


//     // Resolve display names for the grouped IDs.
//     const businessIds = eventsByBusiness.map((b) => b.businessProfileId);
//     const pubIds = eventsByPublication.map((p) => p.publicationId);

//     const [businesses, pubs] = await Promise.all([
//       prisma.businessProfile.findMany({
//         where: { id: { in: businessIds } },
//         include: { business: { select: { businessName: true } } },
//       }),
//       prisma.publication.findMany({ where: { id: { in: pubIds } }, select: { id: true, title: true } }),
//     ]);

//     const businessNameById = Object.fromEntries(
//       businesses.map((b) => [b.id, b.business?.businessName || "Unnamed business"])
//     );
//     const pubTitleById = Object.fromEntries(pubs.map((p) => [p.id, p.title]));

//     const enquiryFunnel = {
//       received: 0,
//       forwarded_to_ghl: 0,
//       delivered: 0,
//       failed: 0,
//     };
//     for (const row of enquiryFunnelRaw) {
//       enquiryFunnel[row.status] = row._count._all;
//     }

//     return NextResponse.json({
//       totals: {
//         profileViews,
//         totalClicks: clickEvents,
//         videoViews,
//         offerActions,
//         enquiries,
//         activeDigitalPartners,
//         // Deltas require a comparison-period query; omitted from this mock.
//       },
//       topBusinesses: eventsByBusiness.map((b) => ({
//         name: businessNameById[b.businessProfileId] || "Unknown",
//         count: b._count._all,
//       })),
//       topPublications: eventsByPublication.map((p) => ({
//         title: pubTitleById[p.publicationId] || "Unknown",
//         count: p._count._all,
//       })),
//       enquiryFunnel,
//     });
//   } catch (err) {
//     console.error("[analytics/overview]", err);
//     return NextResponse.json({ error: "Failed to load overview analytics" }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/analytics/overview?range=30d&publicationId=xxx
//
// Consolidated cross-advertiser totals for the admin dashboard.
// Real implementation should aggregate EngagementEvent + Enquiry with
// Prisma groupBy, scoped by createdAt range and optional publicationId.
//
// "Top businesses" merges two separate event sources by business name:
//   - EngagementEvent.businessProfileId  (Digital Partner profile events)
//   - EngagementEvent.directoryListingId (Directory listing events)
// These are different models with no shared ID, so the merge key is the
// resolved display name, not a foreign key.

function rangeToDate(range) {
  const now = new Date();
  const days = { "7d": 7, "30d": 30, "90d": 90 }[range];
  if (!days) return null; // "all"
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "30d";
  const publicationId = searchParams.get("publicationId") || undefined;
  const since = rangeToDate(range);

  try {
    const where = {
      ...(since && { createdAt: { gte: since } }),
      ...(publicationId && { publicationId }),
    };

    const [
      profileViews,
      clickEvents,
      videoViews,
      offerActions,
      enquiries,
      activeDigitalPartners,
      eventsByBusiness,
      eventsByDirectoryListing,
      eventsByPublication,
      enquiryFunnelRaw,
    ] = await Promise.all([
      prisma.engagementEvent.count({
        where: {
          ...where,
          eventType: { in: ["profile_view", "directory_profile_view"] },
        },
      }),
      prisma.engagementEvent.count({
        where: {
          ...where,
          eventType: { in: ["advert_click", "website_click", "telephone_click", "email_click", "map_click"] },
        },
      }),
      prisma.engagementEvent.count({ where: { ...where, eventType: "video_view" } }),
      prisma.engagementEvent.count({ where: { ...where, eventType: "offer_action" } }),
      prisma.enquiry.count({ where: { ...(since && { createdAt: { gte: since } }), ...(publicationId && { publicationId }) } }),
      prisma.digitalPartner.count({ where: { isActive: true } }),
      prisma.engagementEvent.groupBy({
        by: ["businessProfileId"],
        where: { ...where, businessProfileId: { not: null } },
        _count: { _all: true },
      }),
      prisma.engagementEvent.groupBy({
        by: ["directoryListingId"],
        where: { ...where, directoryListingId: { not: null } },
        _count: { _all: true },
      }),
      prisma.engagementEvent.groupBy({
        by: ["publicationId"],
        where: { ...where, publicationId: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { publicationId: "desc" } },
        take: 8,
      }),
      prisma.enquiry.groupBy({
        by: ["status"],
        where: { ...(since && { createdAt: { gte: since } }), ...(publicationId && { publicationId }) },
        _count: { _all: true },
      }),
    ]);

    // Resolve display names for the grouped IDs.
    const businessIds = eventsByBusiness.map((b) => b.businessProfileId);
    const directoryListingIds = eventsByDirectoryListing.map((d) => d.directoryListingId);
    const pubIds = eventsByPublication.map((p) => p.publicationId);

    const [businesses, directoryListings, pubs] = await Promise.all([
      prisma.businessProfile.findMany({
        where: { id: { in: businessIds } },
        include: { business: { select: { businessName: true } } },
      }),
      prisma.directoryListing.findMany({
        where: { id: { in: directoryListingIds } },
        select: { id: true, businessName: true },
      }),
      prisma.publication.findMany({ where: { id: { in: pubIds } }, select: { id: true, title: true } }),
    ]);

    const businessNameById = Object.fromEntries(
      businesses.map((b) => [b.id, b.business?.businessName || "Unnamed business"])
    );
    const directoryNameById = Object.fromEntries(
      directoryListings.map((d) => [d.id, d.businessName || "Unnamed business"])
    );
    const pubTitleById = Object.fromEntries(pubs.map((p) => [p.id, p.title]));

    // Merge business-profile events and directory-listing events into one
    // ranking, keyed by resolved business name (the two sources have no
    // shared foreign key).
    const countByName = {};
    for (const b of eventsByBusiness) {
      const name = businessNameById[b.businessProfileId] || "Unknown";
      countByName[name] = (countByName[name] || 0) + b._count._all;
    }
    for (const d of eventsByDirectoryListing) {
      const name = directoryNameById[d.directoryListingId] || "Unknown";
      countByName[name] = (countByName[name] || 0) + d._count._all;
    }

    const topBusinesses = Object.entries(countByName)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const enquiryFunnel = {
      received: 0,
      forwarded_to_ghl: 0,
      delivered: 0,
      failed: 0,
    };
    for (const row of enquiryFunnelRaw) {
      enquiryFunnel[row.status] = row._count._all;
    }

    return NextResponse.json({
      totals: {
        profileViews,
        totalClicks: clickEvents,
        videoViews,
        offerActions,
        enquiries,
        activeDigitalPartners,
        // Deltas require a comparison-period query; omitted from this mock.
      },
      topBusinesses,
      topPublications: eventsByPublication.map((p) => ({
        title: pubTitleById[p.publicationId] || "Unknown",
        count: p._count._all,
      })),
      enquiryFunnel,
    });
  } catch (err) {
    console.error("[analytics/overview]", err);
    return NextResponse.json({ error: "Failed to load overview analytics" }, { status: 500 });
  }
}