import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized." }, { status: 401 });
    }

    const { adId } = await params;
    const body = await req.json();
    const { status, rejectionReason } = body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const actor = session.user.email || session.user.id;

    const ad = await prisma.ad.update({
      where: { id: adId },
      data: {
        status,
        rejectionReason: status === "rejected" ? rejectionReason || null : null,
        reviewedAt: new Date(),
        reviewedBy: actor,
      },
    });

    await prisma.auditLog.create({
      data: {
        actor,
        action: `ad_${status}`,
        recordLabel: `Ad:${ad.id}`,
      },
    });

    return NextResponse.json({ ad });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}