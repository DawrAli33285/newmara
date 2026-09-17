import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized." }, { status: 401 });
    }

    const { id:publicationId } = await params;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const ads = await prisma.ad.findMany({
      where: {
        publicationId,
        ...(status ? { status } : {}),
      },
      include: {
        advertiser: { select: { id: true, advertiserName: true } },
      },
      orderBy: { submittedAt: "asc" },
    });

    return NextResponse.json({ ads });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}