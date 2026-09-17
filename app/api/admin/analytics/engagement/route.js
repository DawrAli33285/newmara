// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// // GET /api/admin/analytics/engagement?range=30d&publicationId=xxx

// function rangeToDate(range) {
//   const now = new Date();
//   const days = { "7d": 7, "30d": 30, "90d": 90 }[range];
//   if (!days) return null;
//   return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
// }

// const CLICK_TYPES = ["advert_click", "website_click", "telephone_click", "email_click", "map_click"];

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

//     const [byType, businessGroups] = await Promise.all([
//       prisma.engagementEvent.groupBy({
//         by: ["eventType"],
//         where,
//         _count: { _all: true },
//       }),
//       prisma.engagementEvent.groupBy({
//         by: ["businessProfileId", "eventType"],
//         where: { ...where, businessProfileId: { not: null } },
//         _count: { _all: true },
//       }),
//     ]);

//     // Pivot business+eventType rows into a per-business leaderboard.
//     const byBusiness = {};
//     for (const row of businessGroups) {
//       const id = row.businessProfileId;
//       byBusiness[id] ??= {
//         businessProfileId: id,
//         profileViews: 0,
//         clicks: 0,
//         offerActions: 0,
//         videoViews: 0,
//         enquiries: 0,
//         total: 0,
//       };
//       const count = row._count._all;
//       byBusiness[id].total += count;
//       if (row.eventType === "profile_view") byBusiness[id].profileViews += count;
//       else if (CLICK_TYPES.includes(row.eventType)) byBusiness[id].clicks += count;
//       else if (row.eventType === "offer_action") byBusiness[id].offerActions += count;
//       else if (row.eventType === "video_view") byBusiness[id].videoViews += count;
//       else if (row.eventType === "enquiry_submitted") byBusiness[id].enquiries += count;
//     }

//     const leaderboardRows = Object.values(byBusiness)
//       .sort((a, b) => b.total - a.total)
//       .slice(0, 15);

//     const businesses = await prisma.businessProfile.findMany({
//       where: { id: { in: leaderboardRows.map((r) => r.businessProfileId) } },
//       include: { business: { select: { businessName: true } } },
//     });
//     const nameById = Object.fromEntries(
//       businesses.map((b) => [b.id, b.business?.businessName || "Unnamed business"])
//     );

//     return NextResponse.json({
//       eventsByType: byType.map((row) => ({ eventType: row.eventType, count: row._count._all })),
//       leaderboard: leaderboardRows.map((row) => ({
//         ...row,
//         name: nameById[row.businessProfileId] || "Unknown",
//       })),
//     });
//   } catch (err) {
//     console.error("[analytics/engagement]", err);
//     return NextResponse.json({ error: "Failed to load engagement analytics" }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/analytics/engagement?range=30d&publicationId=xxx
//
// Leaderboard merges two separate event sources by resolved business name:
//   - EngagementEvent.businessProfileId  (Digital Partner profile events)
//   - EngagementEvent.directoryListingId (Directory listing events)
// Directory listings don't have offers/video/enquiries in the schema, so
// their rows only ever contribute to profileViews / clicks.

function rangeToDate(range) {
  const now = new Date();
  const days = { "7d": 7, "30d": 30, "90d": 90 }[range];
  if (!days) return null;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

const CLICK_TYPES = ["advert_click", "website_click", "telephone_click", "email_click", "map_click"];

function emptyRow() {
  return {
    profileViews: 0,
    clicks: 0,
    offerActions: 0,
    videoViews: 0,
    enquiries: 0,
    total: 0,
  };
}

function applyEventCount(row, eventType, count) {
  row.total += count;
  if (eventType === "profile_view" || eventType === "directory_profile_view") row.profileViews += count;
  else if (CLICK_TYPES.includes(eventType)) row.clicks += count;
  else if (eventType === "offer_action") row.offerActions += count;
  else if (eventType === "video_view") row.videoViews += count;
  else if (eventType === "enquiry_submitted") row.enquiries += count;
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

    const [byType, businessGroups, directoryGroups] = await Promise.all([
      prisma.engagementEvent.groupBy({
        by: ["eventType"],
        where,
        _count: { _all: true },
      }),
      prisma.engagementEvent.groupBy({
        by: ["businessProfileId", "eventType"],
        where: { ...where, businessProfileId: { not: null } },
        _count: { _all: true },
      }),
      prisma.engagementEvent.groupBy({
        by: ["directoryListingId", "eventType"],
        where: { ...where, directoryListingId: { not: null } },
        _count: { _all: true },
      }),
    ]);

    // Resolve names up front so both sources can be merged by name.
    const businessIds = [...new Set(businessGroups.map((r) => r.businessProfileId))];
    const directoryListingIds = [...new Set(directoryGroups.map((r) => r.directoryListingId))];

    const [businesses, directoryListings] = await Promise.all([
      prisma.businessProfile.findMany({
        where: { id: { in: businessIds } },
        include: { business: { select: { businessName: true } } },
      }),
      prisma.directoryListing.findMany({
        where: { id: { in: directoryListingIds } },
        select: { id: true, businessName: true },
      }),
    ]);

    const businessNameById = Object.fromEntries(
      businesses.map((b) => [b.id, b.business?.businessName || "Unnamed business"])
    );
    const directoryNameById = Object.fromEntries(
      directoryListings.map((d) => [d.id, d.businessName || "Unnamed business"])
    );

    // Pivot both sources into one leaderboard, keyed by resolved name.
    const byName = {};
    for (const row of businessGroups) {
      const name = businessNameById[row.businessProfileId] || "Unknown";
      byName[name] ??= emptyRow();
      applyEventCount(byName[name], row.eventType, row._count._all);
    }
    for (const row of directoryGroups) {
      const name = directoryNameById[row.directoryListingId] || "Unknown";
      byName[name] ??= emptyRow();
      applyEventCount(byName[name], row.eventType, row._count._all);
    }

    const leaderboard = Object.entries(byName)
      .map(([name, row]) => ({ name, ...row }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 15);

    return NextResponse.json({
      eventsByType: byType.map((row) => ({ eventType: row.eventType, count: row._count._all })),
      leaderboard,
    });
  } catch (err) {
    console.error("[analytics/engagement]", err);
    return NextResponse.json({ error: "Failed to load engagement analytics" }, { status: 500 });
  }
}