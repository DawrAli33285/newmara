import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'business') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }
    const { id } = await params

    const businessProfile = await prisma.businessProfile.findUnique({
      where: { businessId: session.user.id },
      select: { id: true },
    })

    if (!businessProfile) {
      return NextResponse.json({ error: 'No business profile found.' }, { status: 404 })
    }

    const existing = await prisma.offer.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: 'Offer not found.' }, { status: 404 })
    }

    if (existing.businessProfileId !== businessProfile.id) {

      return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
    }

    if (!['draft', 'denied'].includes(existing.status)) {
      return NextResponse.json(
        { error: 'This offer cannot be edited while under review or live.' },
        { status: 409 }
      )
    }

    const body = await req.json()

    const allowedFields = [
      'destinationId', 'title', 'description', 'imageUrl', 'promoCode',
      'category', 'ctaText', 'ctaUrl', 'startDate', 'expiryDate', 'terms',
      'visibility',
    ]

    const data = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) data[field] = body[field]
    }

    if (data.startDate) data.startDate = new Date(data.startDate)
    if (data.expiryDate) data.expiryDate = new Date(data.expiryDate)

    const submit = body.submit === true

    const offer = await prisma.offer.update({
      where: { id },
      data: {
        ...data,
        status: submit ? 'submitted' : 'draft',
        submittedBy: submit ? session.user.email : existing.submittedBy,
        submittedAt: submit ? new Date() : existing.submittedAt,
      },
    })

    return NextResponse.json({ success: true, offer })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}