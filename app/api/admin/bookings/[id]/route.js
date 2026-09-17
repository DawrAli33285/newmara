import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

export async function GET(req, { params }) {
  const { id } = await params;

  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const booking = await prisma.printBooking.findUnique({
    where: { id },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

export async function PATCH(req, { params }) {
  const { id } = await params;

  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await req.json();

  const existing = await prisma.printBooking.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (!body.advertiserId) {
    return NextResponse.json({ error: "Advertiser is required." }, { status: 400 });
  }
  if (!body.startDate) {
    return NextResponse.json({ error: "Start date is required." }, { status: 400 });
  }

  try {
    const booking = await prisma.printBooking.update({
      where: { id },
      data: {
        advertiserId: body.advertiserId,
        publicationId: body.publicationId,
        issueId: body.issueId ?? null,
        packageId: body.packageId ?? null,
        pageNumber: body.pageNumber ?? null,
        pageSpan: body.pageSpan || 1,
        adSize: body.adSize || null,
        position: body.position || null,
        artworkUrl: body.artworkUrl ?? null,
        artworkFileName: body.artworkFileName ?? null,
        artworkFileType: body.artworkFileType ?? null,
        artworkStatus: body.artworkStatus || "awaiting_artwork",
        paymentStatus: body.paymentStatus || "pending",
        startDate: new Date(body.startDate),
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actor: session.user.email || session.user.id,
        action: "booking.update",
        recordLabel: `PrintBooking:${booking.id}`,
      },
    });

    return NextResponse.json({ booking });
  } catch (err) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "This advertiser already has a booking for this publication on that start date." },
        { status: 409 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Could not save booking." }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const existing = await prisma.printBooking.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  await prisma.printBooking.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      actor: session.user.email || session.user.id,
      action: "booking.delete",
      recordLabel: `PrintBooking:${id}`,
    },
  });

  return NextResponse.json({ success: true });
}