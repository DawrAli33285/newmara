import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function PATCH(req, { params }) {
  const { overlayId } = await params
  const body = await req.json()

  const data = {}
  for (const key of ['pageNumber', 'type', 'url', 'label', 'x', 'y', 'width', 'height']) {
    if (body[key] !== undefined) {
      data[key] = ['pageNumber', 'x', 'y', 'width', 'height'].includes(key) ? Number(body[key]) : body[key]
    }
  }

  try {
    const overlay = await prisma.pageOverlay.update({
      where: { id: overlayId },
      data,
    })
    return NextResponse.json(overlay)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Overlay not found' }, { status: 404 })
  }
}


export async function DELETE(req, { params }) {
  const { overlayId } = await params
  try {
    await prisma.pageOverlay.delete({ where: { id: overlayId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Overlay not found' }, { status: 404 })
  }
}
