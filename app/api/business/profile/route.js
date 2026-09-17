import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'business') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

   
    const businessProfile = await prisma.businessProfile.findUnique({
      where: { businessId: session.user.id },
      select: { id: true },
    })

    if (!businessProfile) {
      return NextResponse.json({ error: 'No business profile found for this account.' }, { status: 404 })
    }

    const body = await req.json()

    const allowedFields = [
      'businessName', 'logoUrl', 'description', 'category', 'location',
      'mapUrl', 'website', 'telephone', 'email', 'socialLinks',
      'galleryUrls', 'promoVideoUrl', 'destinationId', 'ctaText', 'ctaUrl',
    ]

    const changes = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) changes[field] = body[field]
    }

    if (Object.keys(changes).length === 0) {
      return NextResponse.json({ error: 'No fields provided to update.' }, { status: 400 })
    }

    if (changes.destinationId) {
      const destination = await prisma.destination.findUnique({
        where: { id: changes.destinationId },
      })

      if (!destination) {
        return NextResponse.json({ error: 'destinationId does not exist.' }, { status: 400 })
      }

      const digitalPartner = await prisma.digitalPartner.findUnique({
        where: { businessProfileId: businessProfile.id },
        include: { publications: true },
      })

      const businessPublicationIds = digitalPartner?.publications.map((p) => p.publicationId) || []

      if (businessPublicationIds.length > 0 && !businessPublicationIds.includes(destination.publicationId)) {
        return NextResponse.json(
          { error: 'destinationId does not belong to one of your publications.' },
          { status: 400 }
        )
      }
    }

    const existingPending = await prisma.businessProfileEdit.findFirst({
      where: { businessProfileId: businessProfile.id, status: 'pending' },
    })

    if (existingPending) {
      return NextResponse.json(
        { error: 'You already have changes pending admin review. Please wait for approval before submitting new edits.' },
        { status: 409 }
      )
    }

    const edit = await prisma.businessProfileEdit.create({
      data: {
        businessProfileId: businessProfile.id,
        changes,
        status: 'pending',
      },
    })

    return NextResponse.json({ success: true, message: 'Changes submitted for admin review.', edit }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'business') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { businessId: session.user.id },  // ← key fix
      include: {
        business: { select: { businessName: true, category: true, email: true } },
        digitalPartner: {
          include: {
            package: true,
            publications: { include: { publication: true } },
          },
        },
        offers: {
          where: { status: 'live', expiryDate: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
        },
        featuredPlacements: true,
        profileEdits: {
          where: { status: 'pending' },
          orderBy: { submittedAt: 'desc' },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'No business profile found.' }, { status: 404 })
    }

    return NextResponse.json({ businessProfile: profile })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}