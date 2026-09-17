
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const { adId } = await params;

  if (!adId) {
    return NextResponse.json({ error: "adId is required" }, { status: 400 });
  }

  try {
    const ad = await prisma.ad.update({
      where: { id: adId },
      data: { clickCount: { increment: 1 } },
      select: { id: true, clickCount: true },
    });

    return NextResponse.json({ success: true, clickCount: ad.clickCount });
  } catch (err) {
   
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}