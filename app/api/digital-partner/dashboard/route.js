import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
  
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'business') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const businessProfileId = session.user.businessProfileId

    if (!businessProfileId) {
      return NextResponse.json({ error: 'No business profile found for this account.' }, { status: 404 })
    }

    const digitalPartner = await prisma.digitalPartner.findUnique({
      where: { businessProfileId },
    })

    if (!digitalPartner || !digitalPartner.isActive) {
      return NextResponse.json(
        { error: 'Dashboard is only available for active Digital Partners.' },
        { status: 403 }
      )
    }

    const eventCounts = await prisma.engagementEvent.groupBy({
      by: ['eventType'],
      where: { businessProfileId },
      _count: { eventType: true },
    })

    const counts = {
      profile_view: 0,
      advert_click: 0,
      website_click: 0,
      telephone_click: 0,
      email_click: 0,
      map_click: 0,
      video_view: 0,
    }

    for (const row of eventCounts) {
      if (counts[row.eventType] !== undefined) {
        counts[row.eventType] = row._count.eventType
      }
    }

    const offers = await prisma.offer.findMany({
      where: { businessProfileId },
      select: {
        id: true,
        title: true,
        status: true,
        expiryDate: true,
      },
    })

    const offerStats = await Promise.all(
      offers.map(async (offer) => {
        const [views, actions] = await Promise.all([
          prisma.engagementEvent.count({
            where: { offerId: offer.id, eventType: 'offer_view' },
          }),
          prisma.engagementEvent.count({
            where: { offerId: offer.id, eventType: 'offer_action' },
          }),
        ])
        return { ...offer, views, actions }
      })
    )

    const enquiryCount = await prisma.enquiry.count({
      where: { businessProfileId },
    })

    return NextResponse.json({
      engagement: counts,
      offers: offerStats,
      enquiryCount,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}