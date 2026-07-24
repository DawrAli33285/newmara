import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  const { id } = await params
  const overlays = await prisma.pageOverlay.findMany({
    where: { issueId: id },
    orderBy: [{ pageNumber: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(overlays)
}


export async function POST(req, { params }) {
  const { id } = await params
  const body = await req.json()

  const { pageNumber, type, url, label, x, y, width, height } = body

  if (!pageNumber || !type || !url) {
    return NextResponse.json({ error: 'pageNumber, type, and url are required' }, { status: 400 })
  }
  if (!['link', 'video'].includes(type)) {
    return NextResponse.json({ error: 'type must be "link" or "video"' }, { status: 400 })
  }

  try {
    const overlay = await prisma.pageOverlay.create({
      data: {
        issueId: id,
        pageNumber: Number(pageNumber),
        type,
        url,
        label: label || null,
        x: Number(x),
        y: Number(y),
        width: Number(width),
        height: Number(height),
      },
    })
    return NextResponse.json(overlay, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create overlay' }, { status: 500 })
  }
}
