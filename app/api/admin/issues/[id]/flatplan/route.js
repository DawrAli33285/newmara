import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const { id: issueId } = await params 

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: { publication: { select: { id: true, title: true } } },
    })

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found.' }, { status: 404 })
    }

    const bookings = await prisma.printBooking.findMany({
      where: { issueId },
      include: {
        advertiser: { select: { id: true, advertiserName: true } },
      },
      orderBy: { pageNumber: 'asc' },
    })

    const totalPages = issue.totalPages || 0

 
    const pages = Array.from({ length: totalPages }, (_, i) => {
      const pageNumber = i + 1
      const booking = bookings.find(
        (b) =>
          b.pageNumber &&
          pageNumber >= b.pageNumber &&
          pageNumber < b.pageNumber + (b.pageSpan || 1)
      )

      if (!booking) return { pageNumber, booking: null }

      return {
        pageNumber,
        booking: {
          id: booking.id,
          advertiserName: booking.advertiser?.advertiserName || '—',
          adSize: booking.adSize,
          artworkStatus: booking.artworkStatus,
          paymentStatus: booking.paymentStatus,
          isSpreadStart: pageNumber === booking.pageNumber,
        },
      }
    })


    const unplaced = bookings
      .filter((b) => !b.pageNumber)
      .map((b) => ({
        id: b.id,
        advertiserName: b.advertiser?.advertiserName || '—',
        adSize: b.adSize,
        artworkStatus: b.artworkStatus,
      }))

    return NextResponse.json({
      issue: {
        id: issue.id,
        title: issue.title,
        issueNumber: issue.issueNumber,
        totalPages,
        publicationTitle: issue.publication.title,
      },
      pages,
      unplaced,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}