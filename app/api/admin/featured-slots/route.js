import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


const VALID_SLOT_TYPES = [
  'featured_business',
  'featured_offer',
  'destination_partner',
  'category_sponsor',
  'homepage_feature',
  'sponsored_article',
  'video_feature',
]

function toSlot(placement) {
  return {
    id: placement.id,
    slotType: placement.placementType,
    title: placement.title,
    businessName: placement.businessName,
    publicationId: placement.publicationId,
    startDate: placement.startDate,
    endDate: placement.endDate,
    priority: placement.priority,
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const placements = await prisma.featuredPlacement.findMany({
      orderBy: [{ startDate: 'desc' }],
    })

    return NextResponse.json({ slots: placements.map(toSlot) })
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
    const { slotType, title, businessName, publicationId, startDate, endDate } = body

    if (!VALID_SLOT_TYPES.includes(slotType)) {
      return NextResponse.json({ error: `slotType must be one of: ${VALID_SLOT_TYPES.join(', ')}` }, { status: 400 })
    }
    if (!startDate) {
      return NextResponse.json({ error: 'startDate is required.' }, { status: 400 })
    }

    const placement = await prisma.featuredPlacement.create({
      data: {
        placementType: slotType,
        title: title || null,
        businessName: businessName || null,
        publicationId: publicationId || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    return NextResponse.json({ slot: toSlot(placement) }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}