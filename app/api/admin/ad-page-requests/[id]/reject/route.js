// app/api/admin/ad-page-requests/[id]/reject/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req, { params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { rejectionReason } = body

  const request = await prisma.adPageRequest.findUnique({ where: { id } })
  if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  if (request.status !== 'pending') {
    return NextResponse.json({ error: 'Request already reviewed' }, { status: 400 })
  }

  const reviewerId = session.user.email || session.user.id

  const updated = await prisma.adPageRequest.update({
    where: { id },
    data: {
      status: 'rejected',
      rejectionReason: rejectionReason || null,
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    },
  })

  // Addendum §18 — record who changed what and when
  await prisma.auditLog.create({
    data: {
      actor: reviewerId,
      action: rejectionReason
        ? `rejected ad page request (${rejectionReason})`
        : `rejected ad page request`,
      recordLabel: `Ad page request: ${updated.id}`,
    },
  })

  return NextResponse.json({ request: updated })
}