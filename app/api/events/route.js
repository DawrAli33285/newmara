import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const VALID_EVENT_TYPES = [
  'profile_view', 'advert_click', 'website_click', 'telephone_click',
  'email_click', 'map_click', 'offer_view', 'offer_action',
  'video_view', 'enquiry_submitted', 'directory_profile_view',
]

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      eventType,
      businessProfileId,
      offerId,
      directoryListingId,
      publicationId,
      issueId,
      campaignLinkId,
      metadata,
    } = body

    if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { error: `eventType must be one of: ${VALID_EVENT_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    if (!businessProfileId && !offerId && !directoryListingId) {
      return NextResponse.json(
        { error: 'At least one of businessProfileId, offerId, or directoryListingId is required.' },
        { status: 400 }
      )
    }

   
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    const event = await prisma.engagementEvent.create({
      data: {
        eventType,
        businessProfileId: businessProfileId || null,
        offerId: offerId || null,
        directoryListingId: directoryListingId || null,
        publicationId: publicationId || null,
        issueId: issueId || null,
        campaignLinkId: campaignLinkId || null,
        userId,
        metadata: metadata || null,
      },
    })

    return NextResponse.json({ success: true, event }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}