// import { prisma } from "@/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { NextResponse } from "next/server";
// import { writeFile, mkdir } from "fs/promises";
// import path from "path";
// import { randomUUID } from "crypto";

// async function getAdvertiserAndPublication(slug, session) {
//   if (!session?.user?.id || session.user.accountType !== "business") {
//     return { error: "Unauthorized", status: 401 };
//   }

//   const publication = await prisma.publication.findUnique({
//     where: { slug },
//   });
//   if (!publication) {
//     return { error: "Publication not found", status: 404 };
//   }

//   const advertiser = await prisma.advertiser.findUnique({
//     where: { businessId: session.user.id },
//   });
//   if (!advertiser) {
//     return { error: "No advertiser profile linked to this account", status: 403 };
//   }

//   return { publication, advertiser };
// }

// export async function GET(request, { params }) {
//   const { slug } = await params;
//   const session = await getServerSession(authOptions);

//   const ctx = await getAdvertiserAndPublication(slug, session);
//   if (ctx.error) {
//     return NextResponse.json({ error: ctx.error }, { status: ctx.status });
//   }

//   const ads = await prisma.ad.findMany({
//     where: {
//       advertiserId: ctx.advertiser.id,
//       publicationId: ctx.publication.id,
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   return NextResponse.json({ ads });
// }

// export async function POST(request, { params }) {
//   const { slug } = await params;
//   const session = await getServerSession(authOptions);

//   const ctx = await getAdvertiserAndPublication(slug, session);
//   if (ctx.error) {
//     return NextResponse.json({ error: ctx.error }, { status: ctx.status });
//   }

//   const formData = await request.formData();
//   const pdf = formData.get("pdf");
//   const linkType = formData.get("linkType");
//   const linkUrl = formData.get("linkUrl");
//   const label = formData.get("label") || null;
//   const priceCents = Number(formData.get("priceCents"));

//   if (!pdf || typeof pdf === "string") {
//     return NextResponse.json({ error: "PDF is required" }, { status: 400 });
//   }
//   if (!linkUrl || !linkUrl.trim()) {
//     return NextResponse.json({ error: "Link URL is required" }, { status: 400 });
//   }
//   if (!priceCents || priceCents <= 0) {
//     return NextResponse.json({ error: "A valid price is required" }, { status: 400 });
//   }

//   const uploadDir = path.join(process.cwd(), "public", "uploads", "ads");
//   await mkdir(uploadDir, { recursive: true });

//   const bytes = await pdf.arrayBuffer();
//   const fileName = `${randomUUID()}.pdf`;
//   await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));

//   const ad = await prisma.ad.create({
//     data: {
//       advertiserId: ctx.advertiser.id,
//       publicationId: ctx.publication.id,
//       pdfUrl: `/uploads/ads/${fileName}`,
//       pdfFileName: pdf.name,
//       linkType,
//       linkUrl: linkUrl.trim(),
//       label,
//       priceCents,
//       status: "pending",
//     },
//   });

//   return NextResponse.json({ ad }, { status: 201 });
// }


import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { PDFDocument } from "pdf-lib";

async function getAdvertiserAndPublication(slug, session) {
  if (!session?.user?.id || session.user.accountType !== "business") {
    return { error: "Unauthorized", status: 401 };
  }

  const publication = await prisma.publication.findUnique({
    where: { slug },
  });
  if (!publication) {
    return { error: "Publication not found", status: 404 };
  }

  const advertiser = await prisma.advertiser.findUnique({
    where: { businessId: session.user.id },
  });
  if (!advertiser) {
    return { error: "No advertiser profile linked to this account", status: 403 };
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

  return { publication, advertiser, allowsVideo, allowsLink };

}


export async function GET(request, { params }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const ctx = await getAdvertiserAndPublication(slug, session);
  if (ctx.error) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const ads = await prisma.ad.findMany({
    where: {
      advertiserId: ctx.advertiser.id,
      publicationId: ctx.publication.id,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ads });
}

export async function POST(request, { params }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const ctx = await getAdvertiserAndPublication(slug, session);
  if (ctx.error) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const formData = await request.formData();
  const pdf = formData.get("pdf");
  const linkType = formData.get("linkType");
  const linkUrl = formData.get("linkUrl");
  const label = formData.get("label") || null;
  const priceCents = Number(formData.get("priceCents"));
  const pageNumberRaw = formData.get("pageNumber");

  if (!pdf || typeof pdf === "string") {
    return NextResponse.json({ error: "PDF is required" }, { status: 400 });
  }
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

  if (priceCents < 0) {
    return NextResponse.json({ error: "A valid price is required" }, { status: 400 });
  }

  const bytes = await pdf.arrayBuffer();

  let pageCount;
  try {
    const pdfDoc = await PDFDocument.load(bytes);
    pageCount = pdfDoc.getPageCount();
  } catch (err) {
    return NextResponse.json({ error: "Could not read the uploaded PDF" }, { status: 400 });
  }

  const pageNumber = Number(pageNumberRaw) || 1;
  if (pageNumber < 1 || pageNumber > pageCount) {
    return NextResponse.json(
      { error: `Page must be between 1 and ${pageCount}` },
      { status: 400 }
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "ads");
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${randomUUID()}.pdf`;
  await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));

  const ad = await prisma.ad.create({
    data: {
      advertiserId: ctx.advertiser.id,
      publicationId: ctx.publication.id,
      pdfUrl: `/uploads/ads/${fileName}`,
      pdfFileName: pdf.name,
      pageNumber,
      linkType,
      linkUrl: linkUrl.trim(),
      label,
      priceCents,
      status: "pending",
    },
  });

  return NextResponse.json({ ad }, { status: 201 });
}