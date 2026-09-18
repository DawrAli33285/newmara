import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

async function loadOwnedAd(slug, adId, session) {
  if (!session?.user?.id || session.user.accountType !== "business") {
    return { error: "Unauthorized", status: 401 };
  }

  const publication = await prisma.publication.findUnique({ where: { slug } });
  if (!publication) {
    return { error: "Publication not found", status: 404 };
  }

  const advertiser = await prisma.advertiser.findUnique({
    where: { businessId: session.user.id },
  });
  if (!advertiser) {
    return { error: "No advertiser profile linked to this account", status: 403 };
  }

  const ad = await prisma.ad.findUnique({ where: { id: adId } });
  if (
    !ad ||
    ad.advertiserId !== advertiser.id ||
    ad.publicationId !== publication.id
  ) {
    return { error: "Ad not found", status: 404 };
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

  return { ad, allowsVideo, allowsLink };
}

export async function PATCH(request, { params }) {
  const { slug, adId } = await params;
  const session = await getServerSession(authOptions);

  const ctx = await loadOwnedAd(slug, adId, session);
  if (ctx.error) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const formData = await request.formData();
  const pdf = formData.get("pdf");
  const linkType = formData.get("linkType");
  const linkUrl = formData.get("linkUrl");
  const label = formData.get("label");
  const priceCents = 0

  if (linkType === "video" && !ctx.allowsVideo) {
    return NextResponse.json(
      { error: "Your package does not include video ads" },
      { status: 403 }
    );
  }
  if (linkType === "link" && !ctx.allowsLink) {
    return NextResponse.json(
      { error: "Your package does not include link ads" },
      { status: 403 }
    );
  }
  if (!linkUrl || !linkUrl.trim()) {
    return NextResponse.json({ error: "Link URL is required" }, { status: 400 });
  }


  const data = {
    linkType,
    linkUrl: linkUrl.trim(),
    label: label ? label.trim() : null,
    priceCents:0,
    status: "pending",
    rejectionReason: null,
    reviewedAt: null,
    reviewedBy: null,
  };

  if (pdf && typeof pdf !== "string") {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "ads");
    await mkdir(uploadDir, { recursive: true });

    const bytes = await pdf.arrayBuffer();
    const fileName = `${randomUUID()}.pdf`;
    await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));

    data.pdfUrl = `/uploads/ads/${fileName}`;
    data.pdfFileName = pdf.name;
  }

  const ad = await prisma.ad.update({
    where: { id: adId },
    data,
  });

  return NextResponse.json({ ad });
}

export async function DELETE(request, { params }) {
  const { slug, adId } = await params;
  const session = await getServerSession(authOptions);

  const ctx = await loadOwnedAd(slug, adId, session);
  if (ctx.error) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  if (ctx.ad.status !== "pending") {
    return NextResponse.json(
      { error: "Only pending ads can be withdrawn" },
      { status: 400 }
    );
  }

  await prisma.adUnlock.deleteMany({ where: { adId } });
  await prisma.ad.delete({ where: { id: adId } });

  return NextResponse.json({ success: true });
}