
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_EVENT_TYPES = new Set([
  "profile_view",
  "advert_click",
  "website_click",
  "telephone_click",
  "email_click",
  "map_click",
  "offer_view",
  "offer_action",
  "video_view",
  "enquiry_submitted",
  "directory_profile_view",
]);

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      eventType,
      businessProfileId,
      offerId,
      directoryListingId,
      publicationId,
      issueId,
      campaignLinkId,
      metadata,
    } = body;

    if (!ALLOWED_EVENT_TYPES.has(eventType)) {
        console.warn(`[track/event] rejected unknown eventType "${eventType}"`);
        return NextResponse.json({ error: `Unknown eventType "${eventType}"` }, { status: 400 });
      }

    await prisma.engagementEvent.create({
      data: {
        eventType,
        businessProfileId: businessProfileId || null,
        offerId: offerId || null,
        directoryListingId: directoryListingId || null,
        publicationId: publicationId || null,
        issueId: issueId || null,
        campaignLinkId: campaignLinkId || null,
        metadata: metadata || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track/event]", err);
 
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}