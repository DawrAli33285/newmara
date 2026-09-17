import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ARTWORK_STATUSES = [
  'awaiting_artwork',
  'received',
  'in_design',
  'awaiting_approval',
  'approved',
  'ready_for_print',
]

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const issueId = searchParams.get('issueId')
    const publicationId = searchParams.get('publicationId')
    const artworkStatus = searchParams.get('artworkStatus')

    const bookings = await prisma.printBooking.findMany({
      where: {
        ...(issueId ? { issueId } : {}),
        ...(publicationId ? { publicationId } : {}),
        ...(artworkStatus ? { artworkStatus } : {}),
      },
      include: {
        advertiser: { select: { id: true, advertiserName: true, telephone: true } },
        publication: { select: { id: true, title: true } },
        issue: { select: { id: true, title: true, issueNumber: true, totalPages: true } },
        package: { select: { id: true, name: true } },
      },
      orderBy: [{ issueId: 'asc' }, { pageNumber: 'asc' }],
    })

    return NextResponse.json({ bookings })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const body = await req.json()
    const {
      advertiserId, publicationId, issueId, packageId,
      pageNumber, pageSpan, adSize, position,
      artworkUrl, artworkStatus,
      startDate, expiryDate, paymentStatus,
    } = body

    const required = { advertiserId, publicationId, startDate }
    for (const [field, value] of Object.entries(required)) {
      if (!value) return NextResponse.json({ error: `${field} is required.` }, { status: 400 })
    }

    if (artworkStatus && !ARTWORK_STATUSES.includes(artworkStatus)) {
      return NextResponse.json(
        { error: `artworkStatus must be one of: ${ARTWORK_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }


    if (issueId && pageNumber) {
      const conflict = await prisma.printBooking.findFirst({
        where: { issueId, pageNumber },
      })
      if (conflict) {
        return NextResponse.json(
          { error: `Page ${pageNumber} of this issue is already booked.` },
          { status: 409 }
        )
      }
    }

    const booking = await prisma.printBooking.create({
      data: {
        advertiserId,
        publicationId,
        issueId: issueId || null,
        packageId: packageId || null,
        pageNumber: pageNumber ?? null,
        pageSpan: pageSpan || 1,
        adSize: adSize || null,
        position: position || null,
        artworkUrl: artworkUrl || null,
        artworkStatus: artworkStatus || 'awaiting_artwork',
        startDate: new Date(startDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        paymentStatus: paymentStatus || 'pending',
      },
      include: {
        advertiser: { select: { id: true, advertiserName: true } },
        publication: { select: { id: true, title: true } },
        issue: { select: { id: true, title: true, issueNumber: true } },
      },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: 'This advertiser already has a booking for this publication on this start date.' },
        { status: 409 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}