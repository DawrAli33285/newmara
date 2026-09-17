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

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()
    const {
      issueId, pageNumber, pageSpan, adSize, position,
      artworkUrl, artworkStatus, paymentStatus,
      startDate, expiryDate, packageId,
    } = body

    if (artworkStatus && !ARTWORK_STATUSES.includes(artworkStatus)) {
      return NextResponse.json(
        { error: `artworkStatus must be one of: ${ARTWORK_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const existing = await prisma.printBooking.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
    }

    const nextIssueId = issueId !== undefined ? issueId : existing.issueId
    const nextPageNumber = pageNumber !== undefined ? pageNumber : existing.pageNumber

    
    if (nextIssueId && nextPageNumber) {
      const conflict = await prisma.printBooking.findFirst({
        where: { issueId: nextIssueId, pageNumber: nextPageNumber, NOT: { id } },
      })
      if (conflict) {
        return NextResponse.json(
          { error: `Page ${nextPageNumber} of this issue is already booked.` },
          { status: 409 }
        )
      }
    }

    const booking = await prisma.printBooking.update({
      where: { id },
      data: {
        issueId: issueId !== undefined ? (issueId || null) : undefined,
        packageId: packageId !== undefined ? (packageId || null) : undefined,
        pageNumber: pageNumber !== undefined ? pageNumber : undefined,
        pageSpan: pageSpan !== undefined ? pageSpan : undefined,
        adSize: adSize !== undefined ? adSize : undefined,
        position: position !== undefined ? position : undefined,
        artworkUrl: artworkUrl !== undefined ? artworkUrl : undefined,
        artworkStatus: artworkStatus !== undefined ? artworkStatus : undefined,
        paymentStatus: paymentStatus !== undefined ? paymentStatus : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        expiryDate: expiryDate !== undefined ? (expiryDate ? new Date(expiryDate) : null) : undefined,
      },
      include: {
        advertiser: { select: { id: true, advertiserName: true } },
        publication: { select: { id: true, title: true } },
        issue: { select: { id: true, title: true, issueNumber: true } },
      },
    })

    return NextResponse.json({ booking })
  } catch (err) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const { id } = params
    await prisma.printBooking.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}