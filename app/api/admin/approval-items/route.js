import { prisma } from "@/lib/prisma";
import { toUiStage } from "@/lib/approval-stages";

function summarizeChanges(changes) {
  if (!changes || typeof changes !== "object") return null;
  const keys = Object.keys(changes);
  if (keys.length === 0) return null;
  return `Updated: ${keys.join(", ")}`;
}


export async function GET() {
  try {
    const [profileEdits, offers, listings, listingEdits] = await Promise.all([
      prisma.businessProfileEdit.findMany({
        include: { businessProfile: { include: { business: true } } },
        orderBy: { submittedAt: "desc" },
      }),
      prisma.offer.findMany({
        include: { businessProfile: { include: { business: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.directoryListing.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.directoryListingEdit.findMany({
        include: { directoryListing: true },
        orderBy: { submittedAt: "desc" },
      }),
    ]);

    const items = [
      ...profileEdits.map((e) => ({
        id: `profile-edit:${e.id}`,
        title: "Business profile update",
        businessName: e.businessProfile?.business?.businessName || "—",
        contentType: "Profile Update",
        summary: summarizeChanges(e.changes),
        stage: toUiStage(e.status),
        submittedBy: e.businessProfile?.business?.businessName || null,
        submittedAt: e.submittedAt,
        reviewedBy: e.reviewedBy,
        scheduledFor: null,
      })),
      ...offers.map((o) => ({
        id: `offer:${o.id}`,
        title: o.title,
        businessName: o.businessProfile?.business?.businessName || "—",
        contentType: "Offer",
        summary: o.description,
        stage: toUiStage(o.status),
        submittedBy: o.submittedBy,
        submittedAt: o.submittedAt || o.createdAt,
        reviewedBy: o.approvedBy,
        scheduledFor: o.startDate,
      })),
      ...listings.map((l) => ({
        id: `directory-listing:${l.id}`,
        title: l.businessName,
        businessName: l.businessName,
        contentType: "Directory Listing",
        summary: l.category,
        stage: toUiStage(l.status),
        submittedBy: l.submittedBy,
        submittedAt: l.submittedAt || l.createdAt,
        reviewedBy: l.approvedBy,
        scheduledFor: null,
      })),
      ...listingEdits.map((e) => ({
        id: `directory-listing-edit:${e.id}`,
        title: "Directory listing update",
        businessName: e.directoryListing?.businessName || "—",
        contentType: "Directory Listing Update",
        summary: summarizeChanges(e.changes),
        stage: toUiStage(e.status),
        submittedBy: e.submittedBy,
        submittedAt: e.submittedAt,
        reviewedBy: e.reviewedBy,
        scheduledFor: null,
      })),
    ];

    items.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    return Response.json({ items });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to load approval items" }, { status: 500 });
  }
}