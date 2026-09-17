import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const body = await req.json()
    const { businessProfileId, publicationId, name, email, phone, message, consentGiven } = body

    const required = ['businessProfileId', 'publicationId', 'name', 'email']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required.` }, { status: 400 })
      }
    }

    if (consentGiven !== true) {
      return NextResponse.json(
        { error: 'Consent is required before submitting an enquiry.' },
        { status: 400 }
      )
    }

    const businessProfile = await prisma.businessProfile.findUnique({
      where: { id: businessProfileId },
      include: { digitalPartner: true },
    })

    if (!businessProfile) {
      return NextResponse.json({ error: 'Business not found.' }, { status: 404 })
    }

    if (!businessProfile.digitalPartner || !businessProfile.digitalPartner.isActive) {
      return NextResponse.json(
        { error: 'This business is not currently accepting enquiries.' },
        { status: 403 }
      )
    }

    const [enquiry] = await prisma.$transaction([
      prisma.enquiry.create({
        data: {
          businessProfileId,
          publicationId,
          name,
          email,
          phone: phone || null,
          message: message || null,
          consentGiven: true,
          status: 'received',
        },
      }),
      prisma.engagementEvent.create({
        data: {
          eventType: 'enquiry_submitted',
          businessProfileId,
          publicationId,
          metadata: { source: 'enquiry_form' },
        },
      }),
    ])

    // TODO: forward to GoHighLevel here once GHL API credentials/webhook are set up (§11/§12)
    // On success: update enquiry.status to 'forwarded_to_ghl', then 'delivered', store ghlContactId
    // On failure: update enquiry.status to 'failed'

    return NextResponse.json({ success: true, enquiry }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}