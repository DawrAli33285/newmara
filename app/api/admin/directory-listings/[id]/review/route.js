
// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

// export async function PATCH(request, { params }) {
//   const session = await getServerSession(authOptions)
//   const { id } = await params
//   const body = await request.json()

//   const data = { status: body.status }
//   if (body.status === 'approved' || body.status === 'live') {
//     data.approvedAt = new Date()
//     data.approvedBy = session?.user?.email || null
//   }
//   if (body.rejectionReason !== undefined) data.rejectionReason = body.rejectionReason

//   const listing = await prisma.directoryListing.update({
//     where: { id },
//     data,
//     include: {
//       publication: true,
//       destination: true,
//       _count: { select: { events: true } },
//     },
//   })

//   return NextResponse.json({ listing })
// }


import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  if (!body.status) {
    return NextResponse.json({ error: 'status is required.' }, { status: 400 })
  }

  const existing = await prisma.directoryListing.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  }

  const reviewerId = session.user.email || session.user.id

  const data = { status: body.status }
  if (body.status === 'approved' || body.status === 'live') {
    data.approvedAt = new Date()
    data.approvedBy = reviewerId
  }

  const listing = await prisma.directoryListing.update({
    where: { id },
    data,
    include: {
      publications: true,
      business: true,
      _count: { select: { events: true } },
    },
  })

  await prisma.auditLog.create({
    data: {
      actor: reviewerId,
      action: `changed status to "${body.status}"${body.rejectionReason ? ` (${body.rejectionReason})` : ''}`,
      recordLabel: `Directory listing: ${listing.businessName}`,
    },
  })

  return NextResponse.json({ listing })
}