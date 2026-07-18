import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
  const { id } = await params
  const { isPublished } = await req.json()

  await prisma.issue.update({
    where: { id },
    data: { isPublished },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req, { params }) {
  const { id } = await params

  await prisma.$transaction([
    prisma.pageView.deleteMany({ where: { issueId: id } }),
    prisma.issueView.deleteMany({ where: { issueId: id } }),
    prisma.pageOverlay.deleteMany({ where: { issueId: id } }),
    prisma.issue.delete({ where: { id } }),
  ])

  return NextResponse.json({ success: true })
}