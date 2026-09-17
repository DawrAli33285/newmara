import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/analytics/enquiries?range=30d&publicationId=xxx

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
    const where = {
      ...(since && { createdAt: { gte: since } }),
      ...(publicationId && { publicationId }),
    };

    const [funnelRaw, recent] = await Promise.all([
      prisma.enquiry.groupBy({ by: ["status"], where, _count: { _all: true } }),
      prisma.enquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 25,
        include: {
          businessProfile: { include: { business: { select: { businessName: true } } } },
          publication: { select: { title: true } },
        },
      }),
    ]);

    const funnel = { received: 0, forwarded_to_ghl: 0, delivered: 0, failed: 0 };
    for (const row of funnelRaw) funnel[row.status] = row._count._all;

    return NextResponse.json({
      funnel,
      recent: recent.map((eq) => ({
        id: eq.id,
        name: eq.name,
        email: eq.email,
        businessName: eq.businessProfile?.business?.businessName || "Unknown",
        publicationTitle: eq.publication?.title || "—",
        consentGiven: eq.consentGiven,
        status: eq.status,
        createdAt: eq.createdAt,
      })),
    });
  } catch (err) {
    console.error("[analytics/enquiries]", err);
    return NextResponse.json({ error: "Failed to load enquiry analytics" }, { status: 500 });
  }
}