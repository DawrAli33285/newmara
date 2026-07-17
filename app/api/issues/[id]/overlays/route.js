import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/issues/[id]/overlays — public read, used by the flipbook viewer.
// Publication/issue publish + subscription gating is already enforced by
// the /read/[slug] page before it renders the viewer, so this endpoint
// intentionally doesn't re-check auth — same pattern as your other
// reader-facing endpoints like /api/views.
export async function GET(req, { params }) {
  const { id } = await params
  const overlays = await prisma.pageOverlay.findMany({
    where: { issueId: id },
    orderBy: { pageNumber: 'asc' },
  })
  return NextResponse.json(overlays)
}
