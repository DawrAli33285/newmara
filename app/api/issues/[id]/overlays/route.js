import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function GET(req, { params }) {
  const { id } = await params
  const overlays = await prisma.pageOverlay.findMany({
    where: { issueId: id },
    orderBy: { pageNumber: 'asc' },
  })
  return NextResponse.json(overlays)
}
