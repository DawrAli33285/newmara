import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/analytics/campaigns?range=30d&publicationId=xxx
//
// "Scans" = EngagementEvent rows attributed to a CampaignLink (campaignLinkId set).

function rangeToDate(range) {
  const now = new Date();
  const days = { "7d": 7, "30d": 30, "90d": 90 }[range];
  if (!days) return null;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "30d";
  const publicationId = searchParams.get("publicationId") || undefined;
  const since = rangeToDate(range);

  try {
    const links = await prisma.campaignLink.findMany({
      where: publicationId ? { publicationId } : undefined,
      include: {
        publication: { select: { title: true } },
        events: {
          where: since ? { createdAt: { gte: since } } : undefined,
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const byChannelMap = {};
    const linkRows = links.map((link) => {
      const scans = link.events.length;
      byChannelMap[link.channel] = (byChannelMap[link.channel] || 0) + scans;
      return {
        id: link.id,
        label: link.label,
        channel: link.channel,
        publicationTitle: link.publication?.title || null,
        scans,
        isActive: link.isActive,
      };
    });

    linkRows.sort((a, b) => b.scans - a.scans);

    return NextResponse.json({
      byChannel: Object.entries(byChannelMap).map(([channel, count]) => ({ channel, count })),
      links: linkRows,
    });
  } catch (err) {
    console.error("[analytics/campaigns]", err);
    return NextResponse.json({ error: "Failed to load campaign analytics" }, { status: 500 });
  }
}