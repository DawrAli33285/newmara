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

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()
    const { slotType, title, businessName, publicationId, startDate, endDate } = body

    if (slotType && !VALID_SLOT_TYPES.includes(slotType)) {
      return NextResponse.json({ error: `slotType must be one of: ${VALID_SLOT_TYPES.join(', ')}` }, { status: 400 })
    }

    const placement = await prisma.featuredPlacement.update({
      where: { id },
      data: {
        placementType: slotType || undefined,
        title: title !== undefined ? title || null : undefined,
        businessName: businessName !== undefined ? businessName || null : undefined,
        publicationId: publicationId !== undefined ? publicationId || null : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
      },
    })

    return NextResponse.json({ slot: toSlot(placement) })
  } catch (err) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Slot not found.' }, { status: 404 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}