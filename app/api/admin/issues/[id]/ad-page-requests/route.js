import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { issueId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.adPageRequest.findMany({
    where: { issueId },
    orderBy: { submittedAt: "desc" },
    include: {
      advertiser: { select: { advertiserName: true } },
    },
  });

  return NextResponse.json({ requests });
}