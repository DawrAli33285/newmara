import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
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

    const digitalPartner = await prisma.digitalPartner.findUnique({
      where: { businessProfileId: businessProfile.id },
    })


    if (!digitalPartner || !digitalPartner.isActive) {
      return NextResponse.json(
        { error: 'Offers require an active Digital Partner package. Print-only advertisers cannot create offers.' },
        { status: 403 }
      )
    }

    const body = await req.json()

    const required = ['publicationId', 'title', 'startDate', 'expiryDate']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required.` }, { status: 400 })
      }
    }

    const allowedFields = [
      'publicationId', 'destinationId', 'title', 'description', 'imageUrl',
      'promoCode', 'category', 'ctaText', 'ctaUrl', 'startDate', 'expiryDate',
      'terms', 'visibility',
    ]

    const data = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) data[field] = body[field]
    }

    const submit = body.submit === true

    const offer = await prisma.offer.create({
      data: {
        ...data,
        businessProfileId: businessProfile.id,
        startDate: new Date(data.startDate),
        expiryDate: new Date(data.expiryDate),
        status: submit ? 'submitted' : 'draft',
        submittedBy: submit ? session.user.email : null,
        submittedAt: submit ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, offer }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const publicationId = searchParams.get('publicationId')
    const destinationId = searchParams.get('destinationId')

    if (!publicationId) {
      return NextResponse.json({ error: 'publicationId is required.' }, { status: 400 })
    }

    const offers = await prisma.offer.findMany({
      where: {
        publicationId,
        ...(destinationId ? { destinationId } : {}),
        status: 'live',
        expiryDate: { gt: new Date() },
        visibility: 'public',
      },
      include: {
        businessProfile: {
          select: { id: true, businessName: true, logoUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ offers })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}